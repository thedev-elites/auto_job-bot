#!/usr/bin/env python
# Auto-update dependencies
import os
import sys
import subprocess

def check_and_update_dependencies():
    """Check and update all dependencies to their latest versions."""
    try:
        # Install pip-review if not already installed
        subprocess.run([sys.executable, "-m", "pip", "install", "--upgrade", "pip-review"], 
                       stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        print("✅ pip-review installed successfully")
        
        # Automatically update all packages
        print("📦 Updating all dependencies to latest versions...")
        result = subprocess.run([sys.executable, "-m", "pip_review", "--auto"], 
                               stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        print("✅ All dependencies updated successfully!")
        
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error updating dependencies: {e}")
        print(f"Error output: {e.stderr.decode()}")
        return False

# Run dependency check and update at startup
check_and_update_dependencies()

# Now import all required packages
import time
import json
import os
import concurrent.futures
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import requests
from urllib.parse import urlparse
import pymongo
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

# MongoDB Connection Details
MONGODB_URI = "mongodb+srv://thedevelites:rahulshivamgdg2025@cluster.wltaw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster"
DB_NAME = "internshala_jobs"
COLLECTION_NAME = "jobs"  # Default collection, will also create location-based collections

# Create a directory for caching job details
CACHE_DIR = "job_cache"
os.makedirs(CACHE_DIR, exist_ok=True)

def connect_to_mongodb():
    """Connect to MongoDB and return the database and collection objects."""
    try:
        # Create a new client and connect to the server
        client = MongoClient(MONGODB_URI, server_api=ServerApi('1'))
        
        # Send a ping to confirm a successful connection
        client.admin.command('ping')
        print("Successfully connected to MongoDB!")
        
        # Get database and collection
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]
        
        # Create index on Job URL to ensure uniqueness and faster queries
        collection.create_index("Job URL", unique=True)
        
        # Test insertion to validate write permissions
        test_doc = {"_id": "test_connection", "timestamp": datetime.now().isoformat()}
        collection.update_one({"_id": "test_connection"}, {"$set": test_doc}, upsert=True)
        print("Connection test successful - able to write to database!")
        collection.delete_one({"_id": "test_connection"})
        
        return client, db, collection
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        return None, None, None

def save_job_to_mongodb(collection, job_data):
    """Save a job to MongoDB collection and to location-based collection."""
    if collection is None:
        print("MongoDB collection not available, skipping database save.")
        return False
    
    try:
        # Use the Job URL as a unique identifier
        job_url = job_data.get("Job URL", "")
        if job_url == "N/A" or not job_url:
            # Generate a unique ID if no URL is available
            job_url = f"job_{hash(json.dumps(job_data, sort_keys=True))}"
            job_data["Job URL"] = job_url
        
        # Add timestamp for when this job was last updated
        job_data["last_updated"] = datetime.now().isoformat()
        
        # Save to main jobs collection
        print(f"Attempting to save job '{job_data.get('Job Title')}' to MongoDB...")
        
        result = collection.update_one(
            {"Job URL": job_url},
            {"$set": job_data},
            upsert=True
        )
        
        # Get the job location for location-based collection
        location = job_data.get("Location", "Unknown")
        
        # Clean location name to make it suitable for collection name
        # If multiple locations are listed, split and use the first one
        if "," in location:
            location = location.split(",")[0].strip()
        
        # Replace spaces and special characters to create valid collection name
        location_collection_name = location.lower().replace(" ", "_").replace("-", "_")
        
        # Remove any remaining special characters
        location_collection_name = ''.join(c for c in location_collection_name if c.isalnum() or c == '_')
        
        if location_collection_name:
            # Get the database instance from the collection
            db = collection.database
            
            # Get or create the location-specific collection
            location_collection = db[location_collection_name]
            
            # Create index if it doesn't exist
            if "Job URL_1" not in location_collection.index_information():
                location_collection.create_index("Job URL", unique=True)
            
            # Save job to location-specific collection
            location_result = location_collection.update_one(
                {"Job URL": job_url},
                {"$set": job_data},
                upsert=True
            )
            
            if location_result.upserted_id:
                print(f"Job added to location collection '{location_collection_name}'")
            else:
                print(f"Job updated in location collection '{location_collection_name}'")
        
        if result.upserted_id:
            print(f"SUCCESS: Job added to MongoDB: {job_data.get('Job Title', 'Unknown title')}")
        else:
            print(f"SUCCESS: Job updated in MongoDB: {job_data.get('Job Title', 'Unknown title')}")
        
        # Verify the document exists after insertion
        verification = collection.find_one({"Job URL": job_url})
        if verification:
            print(f"VERIFICATION: Document exists in database with _id: {verification.get('_id')}")
        else:
            print(f"VERIFICATION FAILED: Document not found after insertion!")
            
        return True
    except pymongo.errors.DuplicateKeyError:
        print(f"Job already exists in MongoDB: {job_data.get('Job Title', 'Unknown title')}")
        return True
    except Exception as e:
        print(f"ERROR saving job to MongoDB: {str(e)}")
        print(f"Job data that failed: {job_data.get('Job Title')}")
        return False

def get_cached_job_details(job_url):
    """Retrieves cached job details if available"""
    job_id = urlparse(job_url).path.split('/')[-1]
    cache_path = os.path.join(CACHE_DIR, f"{job_id}.json")
    
    if os.path.exists(cache_path):
        try:
            # Check if cache is less than 6 hours old
            if time.time() - os.path.getmtime(cache_path) < 21600:  # 6 hours in seconds
                with open(cache_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
        except Exception:
            pass
    return None

def save_job_to_cache(job_url, job_details):
    """Saves job details to cache"""
    try:
        job_id = urlparse(job_url).path.split('/')[-1]
        cache_path = os.path.join(CACHE_DIR, f"{job_id}.json")
        with open(cache_path, 'w', encoding='utf-8') as f:
            json.dump(job_details, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Error saving to cache: {e}")

def scrape_job_details(driver, job_url):
    """Scrapes detailed information from the individual job page with caching."""
    # Check cache first
    cached_data = get_cached_job_details(job_url)
    if cached_data:
        print(f"Using cached data for {job_url}")
        return cached_data
        
    try:
        driver.get(job_url)
        
        # Wait for the job details page to load - use a faster wait strategy
        try:
            WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.CLASS_NAME, 'individual_internship'))
            )
        except Exception:
            # If timeout occurs, check if page has content anyway
            if "individual_internship" not in driver.page_source:
                return "Could not load job details page."
        
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        job_detail = soup.find('div', class_='individual_internship')
        
        if not job_detail:
            return "Could not find job details on the page."
        
        job_details_dict = {}
        
        # Extract job profile/title
        profile_elem = job_detail.find('div', class_='profile')
        if profile_elem:
            job_details_dict['Job Profile'] = profile_elem.get_text(strip=True)
        
        # Extract company name
        company_name_elem = job_detail.find('div', class_='company_name')
        if company_name_elem and company_name_elem.find('a'):
            job_details_dict['Company Name'] = company_name_elem.find('a').get_text(strip=True)
        
        # Extract location
        location_elem = job_detail.find('p', id='location_names')
        if location_elem:
            job_details_dict['Location'] = location_elem.get_text(strip=True)
        
        # Extract start date
        start_date_elem = job_detail.find('div', id='start-date-first')
        if start_date_elem:
            job_details_dict['Start Date'] = start_date_elem.get_text(strip=True)
        
        # Extract salary/CTC
        salary_elem = job_detail.find('div', class_='salary')
        if salary_elem and salary_elem.find('span', class_='desktop'):
            job_details_dict['Salary/CTC'] = salary_elem.find('span', class_='desktop').get_text(strip=True)
        
        # Extract experience
        experience_elem = job_detail.find('div', class_='job-experience-item')
        if experience_elem and experience_elem.find('div', class_='desktop-text'):
            job_details_dict['Experience Required'] = experience_elem.find('div', class_='desktop-text').get_text(strip=True)
        
        # Extract apply by date
        apply_by_elem = job_detail.find('div', string='Apply By')
        if apply_by_elem and apply_by_elem.find_next('div', class_='item_body'):
            job_details_dict['Apply By'] = apply_by_elem.find_next('div', class_='item_body').get_text(strip=True)
        
        # Extract posted time
        posted_time_elem = job_detail.find('div', class_='status-success')
        if posted_time_elem:
            job_details_dict['Posted Time'] = posted_time_elem.get_text(strip=True)
        
        # Extract job type (Full time/Part time)
        job_type_elems = job_detail.find_all('div', class_='status-inactive')
        if job_type_elems:
            job_details_dict['Job Type'] = ", ".join([elem.get_text(strip=True) for elem in job_type_elems])
        
        # Extract number of applicants
        applicants_elem = job_detail.find('div', class_='applications_message')
        if applicants_elem:
            job_details_dict['Number of Applicants'] = applicants_elem.get_text(strip=True)
        
        # Extract "Apply now" button link
        buttons_container = soup.find('div', class_='buttons_container')
        apply_now_link = 'N/A'
        if buttons_container:
            apply_now_anchor = buttons_container.find('a')
            if apply_now_anchor:
                apply_now_href = apply_now_anchor.get('href')
                if apply_now_href:
                    apply_now_link = 'https://internshala.com' + apply_now_href
        job_details_dict['Apply Now Link'] = apply_now_link
        
        # Helper function to clean and format text with proper spacing and structure
        def format_job_description(text):
            if not text:
                return ""
                
            # Get individual lines and remove empty ones
            lines = [line.strip() for line in text.split('\n') if line.strip()]
            
            # Format the text to maintain structure
            formatted_lines = []
            i = 0
            while i < len(lines):
                current_line = lines[i]
                
                # Check if the line is a heading (usually short and might end with a colon)
                is_heading = (len(current_line) < 50 and 
                             (current_line.endswith(':') or 
                              (i+1 < len(lines) and lines[i+1].startswith('1.')) or
                              any(keyword in current_line.lower() for keyword in ['responsibilities', 'requirements', 'perks', 'details', 'skills', 'qualifications', 'benefits'])
                             ))
                
                # If it's a heading but doesn't have a colon, add one
                if is_heading and not current_line.endswith(':'):
                    current_line += ':'
                
                formatted_lines.append(current_line)
                
                # Add extra line break after headings
                if is_heading:
                    formatted_lines.append('')
                
                # If the next line is a numbered point, make sure we have proper spacing
                if i+1 < len(lines) and (lines[i+1].startswith('1.') or lines[i+1].startswith('•')):
                    if formatted_lines[-1] != '':  # Only add empty line if not already there
                        formatted_lines.append('')
                        
                i += 1
            
            # Join the lines with newlines
            return '\n'.join(formatted_lines)
        
        # Find the internship_details div which contains additional information
        internship_details = soup.find('div', class_='internship_details')
        if internship_details:
            detailed_sections = {}
            
            # About the job / job description
            about_heading = internship_details.find('h2', string='About the job')
            if about_heading:
                text_container = about_heading.find_next('div', class_='text-container')
                if text_container:
                    detailed_sections['About the job'] = format_job_description(text_container.get_text())
            
            # Skills required
            skills_heading = internship_details.find('h3', class_='skills_heading')
            if skills_heading:
                skills_container = skills_heading.find_next('div', class_='round_tabs_container')
                if skills_container:
                    skills = skills_container.find_all('span', class_='round_tabs')
                    if skills:
                        detailed_sections['Skill(s) required'] = '\n'.join([skill.get_text(strip=True) for skill in skills])
            
            # Who can apply
            who_can_apply_heading = internship_details.find('p', string='Who can apply')
            if who_can_apply_heading:
                text_container = who_can_apply_heading.find_next('div', class_='text-container')
                if text_container:
                    detailed_sections['Who can apply'] = format_job_description(text_container.get_text())
            
            # Other requirements
            other_reqs_heading = internship_details.find('h3', string='Other requirements')
            if other_reqs_heading:
                text_container = other_reqs_heading.find_next('div', class_='text-container')
                if text_container:
                    detailed_sections['Other requirements'] = format_job_description(text_container.get_text())
            
            # Salary details (additional)
            salary_heading = internship_details.find('div', string='Salary')
            if salary_heading:
                # Check for probation details
                probation_container = salary_heading.find_next('div', class_='probation-salary-container')
                salary_container = salary_heading.find_next('div', class_='salary_container')
                
                salary_info = []
                
                # Extract probation details if available
                if probation_container and not probation_container.get('style') == 'display: none':
                    probation_duration = probation_container.find('div', string=lambda s: 'Duration:' in s if s else False)
                    if probation_duration:
                        salary_info.append(f"Probation: \nDuration: {probation_duration.get_text().replace('Duration:', '').strip()}")
                    
                    probation_salary = probation_container.find('div', string=lambda s: 'Salary during probation:' in s if s else False)
                    if probation_salary:
                        salary_info.append(f"Salary during probation: {probation_salary.get_text().replace('Salary during probation:', '').strip()}")
                    
                    after_probation = probation_container.find('div', string=lambda s: 'After probation:' in s if s else False)
                    if after_probation:
                        salary_info.append(f"After probation:")
                
                # Extract regular salary details
                if salary_container:
                    salary_info.append(format_job_description(salary_container.get_text()))
                
                if salary_info:
                    detailed_sections['Salary'] = '\n'.join(salary_info)
            
            # Number of openings
            openings_heading = internship_details.find('h3', string='Number of openings')
            if openings_heading:
                text_container = openings_heading.find_next('div', class_='text-container')
                if text_container:
                    detailed_sections['Number of openings'] = text_container.get_text(strip=True)
            
            # About the company 
            about_company_heading = internship_details.find('h2', class_='section_heading heading_5_5')
            if about_company_heading:
                company_name = about_company_heading.get_text(strip=True)
                
                # Get the about company text
                text_container = internship_details.find('div', class_='text-container about_company_text_container')
                if not text_container:  # Fallback to standard text-container
                    text_container = about_company_heading.find_next('div', class_='text-container')
                
                if text_container:
                    detailed_sections[company_name] = format_job_description(text_container.get_text())
                
                # Look for the company website link
                website_link_container = internship_details.find('div', class_='text-container website_link')
                if website_link_container and website_link_container.find('a'):
                    website_link = website_link_container.find('a').get('href')
                    detailed_sections['Company Website'] = website_link
            
            # Fallback about company search
            if not about_company_heading:
                about_company_heading = internship_details.find('h2', class_='section_heading', string=lambda t: t and 'About' in t)
                if about_company_heading:
                    company_name = about_company_heading.get_text(strip=True)
                    
                    text_container = internship_details.find('div', class_='text-container about_company_text_container')
                    if not text_container:
                        text_container = about_company_heading.find_next('div', class_='text-container')
                    
                    if text_container:
                        detailed_sections[company_name] = format_job_description(text_container.get_text())
            
            # Certification skills
            training_containers = internship_details.find_all('div', class_='training_skills_container')
            for container in training_containers:
                heading = container.find('div', class_='training_skills_container_heading')
                if heading and heading.get_text(strip=True) == 'Earn certifications in these skills':
                    skills_links = container.find_all('a', class_='training_link_tag')
                    if skills_links:
                        detailed_sections['Earn certifications in these skills'] = '\n'.join([link.get_text(strip=True) for link in skills_links])
            
            # Activity section (hiring since, candidates hired, etc.)
            activity_section = internship_details.find('div', class_='activity_section')
            if activity_section:
                activity_heading = activity_section.find('div', class_='heading_activity')
                activities = activity_section.find_all('div', class_='activity')
                
                if activity_heading and activities:
                    activity_texts = []
                    for activity in activities:
                        text_elem = activity.find('div', class_='text')
                        if text_elem:
                            activity_texts.append(text_elem.get_text(strip=True))
                    
                    if activity_texts:
                        detailed_sections[activity_heading.get_text(strip=True)] = ', '.join(activity_texts)
            
            job_details_dict['detailed_sections'] = detailed_sections
        
        # Cache the job details for future requests
        save_job_to_cache(job_url, job_details_dict)
        return job_details_dict
    except Exception as e:
        return f"Error scraping job details: {str(e)}"

def scrape_job_data(driver):
    """Scrapes job data from the page and prints debug output if expected elements are missing."""
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    job_listings = soup.find_all('div', class_='individual_internship')
    jobs = []

    for job in job_listings:
        # Skip promotional cards that don't contain actual job listings
        if job.get('id') and ('pgc_' in job.get('id') or 'ad_' in job.get('id')):
            continue
            
        # Try to find the container with job details.
        internship_meta = job.find('div', class_='internship_meta')
        if not internship_meta:
            continue  # Skip this listing

        # Extract company logo
        logo_container = job.find('div', class_='internship_logo')
        logo_url = 'N/A'
        if logo_container and logo_container.find('img'):
            logo_url = logo_container.find('img').get('src', 'N/A')

        # Extract job title and URL
        job_title_elem = internship_meta.find('a', class_='job-title-href')
        job_title = job_title_elem.get_text(strip=True) if job_title_elem else 'N/A'
        
        # Extract job URL
        job_url = 'N/A'
        if job_title_elem:
            job_url = 'https://internshala.com' + job_title_elem.get('href', '') if job_title_elem.get('href') else 'N/A'
        
        # Extract company name.
        company_name_elem = internship_meta.find('div', class_='company_name')
        company_name = company_name_elem.get_text(strip=True) if company_name_elem else 'N/A'
        if company_name.endswith("Actively hiring"):
            company_name = company_name.replace("Actively hiring", "").strip()

        # Extract detail row containing salary, experience, location, etc.
        detail_row = internship_meta.find('div', class_='detail-row-1')

        # Helper: Identify salary element.
        def is_salary_element(tag):
            if tag.name == 'div':
                classes = tag.get('class', [])
                if isinstance(classes, str):
                    classes = [classes]
                return 'row-1-item' in classes and tag.find('i', class_='ic-16-money') is not None
            return False

        salary_element = detail_row.find(is_salary_element) if detail_row else None
        salary = (salary_element.find('span', class_='desktop').get_text(strip=True)
                  if salary_element and salary_element.find('span', class_='desktop')
                  else 'N/A')

        # Helper: Identify experience/ duration element.
        def is_start_or_duration_element(tag):
            if tag.name == 'div':
                classes = tag.get('class', [])
                if isinstance(classes, str):
                    classes = [classes]
                return 'row-1-item' in classes and tag.find('i', class_='ic-16-briefcase') is not None
            return False

        start_or_duration_element = detail_row.find(is_start_or_duration_element) if detail_row else None
        experience_required = (start_or_duration_element.find('span').get_text(strip=True)
                               if start_or_duration_element and start_or_duration_element.find('span')
                               else 'N/A')

        # Helper: Identify location element.
        def is_location_element(tag):
            if tag.name == 'p':
                classes = tag.get('class', [])
                if isinstance(classes, str):
                    classes = [classes]
                return 'row-1-item' in classes and 'locations' in classes
            return False

        location_element = detail_row.find(is_location_element) if detail_row else None
        location = location_element.get_text(strip=True) if location_element else 'N/A'

        # Extract posted time information.
        posted_time_element = job.find('div', class_='color-labels')
        posted_time = posted_time_element.get_text(strip=True) if posted_time_element else 'N/A'
        posted_time = posted_time.replace("Posted Time:", "").strip()

        # Adjust posted time if "Be an early applicant" info is available.
        early_applicant_element = job.find('div', class_='early_applicant_wrapper')
        if early_applicant_element and early_applicant_element.find('span'):
            posted_time = posted_time.replace("Be an early applicant", "").strip()
            if any(x in posted_time.lower() for x in ["day ago", "days ago", "today", "hours ago", "hour ago"]):
                posted_time = f"{posted_time} (Be an early applicant)"

        # Check if actively hiring badge exists.
        application_status = "N/A"
        if job.find('div', class_='actively-hiring-badge'):
            application_status = "Actively hiring"

        # Extract job type from gray labels.
        job_type = 'N/A'
        gray_labels = job.find('div', class_='gray-labels')
        if gray_labels:
            status_spans = gray_labels.find_all('span')
            job_types = [span.get_text(strip=True) for span in status_spans]
            if job_types:
                job_type = " . ".join(job_types)

        # Save the extracted job data.
        job_data = {
            "Job Title": job_title,
            "Company Name": company_name,
            "Company Logo": logo_url,
            "Location": location,
            "Experience Required": experience_required,
            "Application Status": application_status,
            "Salary": salary,
            "Posted Time": posted_time,
            "Job Type": job_type,
            "Job URL": job_url
        }
        jobs.append(job_data)

    return jobs

def process_job_detail(driver_pool, job):
    """Process a single job's details using a driver from the pool."""
    driver = driver_pool.pop()
    
    try:
        if job['Job URL'] != 'N/A':
            detailed_info = scrape_job_details(driver, job['Job URL'])
            job['detailed_info'] = detailed_info
    except Exception as e:
        job['detailed_info'] = f"Error: {str(e)}"
    finally:
        driver_pool.append(driver)
    
    return job

def create_driver():
    """Create and configure a new Chrome driver."""
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--log-level=3")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--disable-infobars")
    chrome_options.add_argument("--disable-features=VizDisplayCompositor")
    chrome_options.add_argument("--disable-software-rasterizer")
    
    # Create a unique user data directory for each instance to avoid conflicts
    import tempfile
    import uuid
    temp_dir = os.path.join(tempfile.gettempdir(), f"chrome_profile_{uuid.uuid4()}")
    chrome_options.add_argument(f"--user-data-dir={temp_dir}")
    
    chrome_options.page_load_strategy = 'eager'  # Don't wait for images/stylesheets
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    driver.set_page_load_timeout(10)
    return driver

def print_job_info(job, include_details=True):
    """Print job information in a formatted way."""
    print(f"\n{'=' * 80}")
    print(f"Job: {job['Job Title']}")
    print(f"{'=' * 80}")
    print(f"Company: {job['Company Name']}")
    print(f"Location: {job['Location']}")
    print(f"Experience: {job['Experience Required']}")
    print(f"Status: {job['Application Status']}")
    print(f"Salary: {job['Salary']}")
    print(f"Posted: {job['Posted Time']}")
    print(f"Type: {job['Job Type']}")
    print(f"URL: {job['Job URL']}")
    
    if include_details and 'detailed_info' in job and isinstance(job['detailed_info'], dict):
        detailed_info = job['detailed_info']
        
        print(f"\n{'-' * 40}")
        print("DETAILED JOB INFORMATION")
        print(f"{'-' * 40}")
        
        # Print basic details
        for key, value in detailed_info.items():
            if key != 'detailed_sections' and key != 'Apply Now Link':
                print(f"{key}: {value}")
        
        # Show apply link
        if 'Apply Now Link' in detailed_info and detailed_info['Apply Now Link'] != 'N/A':
            print(f"\n{'*' * 20} APPLY NOW {'*' * 20}")
            print(f"Application Link: {detailed_info['Apply Now Link']}")
            print(f"{'*' * 50}")
        
        # Print detailed sections
        if 'detailed_sections' in detailed_info:
            print(f"\n{'-' * 40}")
            for section_title, section_content in detailed_info['detailed_sections'].items():
                if section_title == 'Company Website':
                    continue
                    
                print(f"\n{section_title}")
                
                if section_title.startswith('About ') and 'Company Website' in detailed_info['detailed_sections']:
                    website_link = detailed_info['detailed_sections']['Company Website']
                    print(f"{website_link}\n")
                
                if section_title in ['Skill(s) required', 'Earn certifications in these skills']:
                    print()
                    for skill in section_content.split('\n'):
                        if skill.strip():
                            print(f"• {skill.strip()}")
                else:
                    print(f"{section_content}")

def main():
    """Main function with optimized scraping and real-time monitoring."""
    # Create driver pool for concurrent processing
    NUM_DRIVERS = 4  # Adjust based on your system's capabilities
    driver_pool = [create_driver() for _ in range(NUM_DRIVERS)]
    
    # Main driver for listing page
    main_driver = create_driver()
    
    # Connect to MongoDB
    mongo_client, mongo_db, mongo_collection = connect_to_mongodb()
    if mongo_collection is None:
        print("Warning: MongoDB connection failed. Data will not be stored in the database.")
    else:
        # Test insertion to verify database is working
        test_job = {
            "Job Title": "Test Job",
            "Company Name": "Test Company",
            "Job URL": "https://test.com/job_test",
            "timestamp": datetime.now().isoformat()
        }
        save_result = save_job_to_mongodb(mongo_collection, test_job)
        print(f"Test job insertion result: {save_result}")
        
        # Verify collection has at least one document after test insertion
        try:
            count = mongo_collection.count_documents({})
            print(f"Current document count in collection: {count}")
            if count > 0:
                print("Database is properly storing documents!")
            else:
                print("WARNING: No documents found in collection after test insertion!")
        except Exception as e:
            print(f"Error checking document count: {e}")
    
    # Track already processed jobs to avoid duplication
    processed_job_urls = set()
    
    # Dictionary to keep track of jobs on each page
    page_job_mapping = {}
    
    # Get all existing job URLs from MongoDB to avoid re-processing
    if mongo_collection is not None:
        try:
            existing_jobs = mongo_collection.find({}, {"Job URL": 1})
            for job in existing_jobs:
                if "Job URL" in job and job["Job URL"] != "N/A":
                    processed_job_urls.add(job["Job URL"])
            print(f"Loaded {len(processed_job_urls)} existing job URLs from database")
        except Exception as e:
            print(f"Error loading existing jobs: {e}")
    
    try:
        # Initial scrape of all pages to establish baseline
        print("\n=== INITIAL SCRAPING OF ALL PAGES ===")
        max_pages = scan_all_pages(main_driver, driver_pool, mongo_collection, processed_job_urls, page_job_mapping)
        
        # Real-time monitoring loop
        print("\n=== STARTING REAL-TIME MONITORING ===")
        monitoring_cycle = 1
        
        while True:
            print(f"\n{'=' * 80}")
            print(f"REAL-TIME MONITORING CYCLE #{monitoring_cycle}")
            print(f"{'=' * 80}")
            print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            
            # Check each page for new jobs
            new_jobs_found = monitor_all_pages(main_driver, driver_pool, mongo_collection, 
                                              processed_job_urls, page_job_mapping, max_pages)
            
            if new_jobs_found:
                print(f"\n✨ Found {new_jobs_found} new job listings in monitoring cycle #{monitoring_cycle}")
            else:
                print(f"\n😴 No new jobs found in monitoring cycle #{monitoring_cycle}")
            
            # Check if we need to scan for new pages
            if monitoring_cycle % 5 == 0:  # Every 5 cycles
                print("\n🔍 Checking for new pages...")
                new_max_pages = check_for_new_pages(main_driver, max_pages)
                if new_max_pages > max_pages:
                    print(f"📊 Found {new_max_pages - max_pages} new pages! Updating max page count to {new_max_pages}")
                    max_pages = new_max_pages
                else:
                    print("No new pages found.")
            
            # Wait before next monitoring cycle - shorter interval for real-time monitoring
            wait_time = 180  # 3 minutes
            print(f"\nWaiting {wait_time} seconds before next monitoring cycle...")
            print(f"Current time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"Next check at: {(datetime.now() + datetime.timedelta(seconds=wait_time)).strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"{'=' * 80}")
            
            time.sleep(wait_time)
            monitoring_cycle += 1
            
    except KeyboardInterrupt:
        print("\nMonitoring stopped by user.")
    finally:
        # Clean up all drivers
        for driver in driver_pool + [main_driver]:
            try:
                driver.quit()
            except:
                pass
                
        # Close MongoDB connection
        if mongo_client is not None:
            mongo_client.close()
            print("MongoDB connection closed.")
            
        print("All browser instances closed.")
        print(f"Total unique jobs processed: {len(processed_job_urls)}")

def scan_all_pages(main_driver, driver_pool, mongo_collection, processed_job_urls, page_job_mapping):
    """Scan all pages to establish baseline and return max page number."""
    page_num = 1
    while True:
        start_time = time.time()
        
        # Construct URL based on page number
        url = "https://internshala.com/jobs/"
        if page_num > 1:
            url = f"https://internshala.com/jobs/page-{page_num}/"
        
        try:
            main_driver.get(url)
            # Wait until job listings are present
            WebDriverWait(main_driver, 10).until(
                EC.presence_of_all_elements_located((By.CLASS_NAME, 'individual_internship'))
            )
        except Exception as e:
            print(f"Error loading page {page_num}: {e}")
            # If we can't load the page, we've probably reached the end
            print("No more pages available. Initial scan complete.")
            return page_num - 1
        
        # Scrape job listings
        job_data = scrape_job_data(main_driver)
        if not job_data:
            print(f"No job data found on page {page_num}.")
            return page_num - 1
        
        print(f"\nFound {len(job_data)} job listings on page {page_num}. Processing...\n")
        
        # Store job URLs for this page for future comparison
        page_job_mapping[page_num] = set(job['Job URL'] for job in job_data if job['Job URL'] != 'N/A')
        
        # Filter out jobs we've already processed
        new_jobs = [job for job in job_data if job['Job URL'] not in processed_job_urls and job['Job Title'] != 'N/A']
        
        if new_jobs:
            print(f"Processing {len(new_jobs)} new jobs from page {page_num}...")
            
            # Process job details concurrently
            process_new_jobs(driver_pool, new_jobs, mongo_collection, processed_job_urls)
        else:
            print(f"No new jobs found on page {page_num}.")
        
        # Calculate and display the time taken for this update
        elapsed_time = time.time() - start_time
        print(f"\n{'*' * 40}")
        print(f"Scanned page {page_num} in {elapsed_time:.2f} seconds")
        print(f"Total unique jobs processed so far: {len(processed_job_urls)}")
        print(f"{'*' * 40}")
        
        # Increment page number
        page_num += 1
        
        # Sleep before next page - adaptive sleep time based on how many jobs were found
        wait_time = 5 if new_jobs else 2
        print(f"Waiting {wait_time} seconds before next page...")
        time.sleep(wait_time)

def monitor_all_pages(main_driver, driver_pool, mongo_collection, processed_job_urls, page_job_mapping, max_pages):
    """Monitor all pages for new job listings and return count of new jobs found."""
    total_new_jobs = 0
    
    # Check each page for new jobs, starting from page 1
    for page_num in range(1, max_pages + 1):
        print(f"\nChecking page {page_num}/{max_pages} for new jobs...")
        start_time = time.time()
        
        # Construct URL based on page number
        url = "https://internshala.com/jobs/"
        if page_num > 1:
            url = f"https://internshala.com/jobs/page-{page_num}/"
        
        try:
            main_driver.get(url)
            # Wait until job listings are present
            WebDriverWait(main_driver, 10).until(
                EC.presence_of_all_elements_located((By.CLASS_NAME, 'individual_internship'))
            )
        except Exception as e:
            print(f"Error loading page {page_num}: {e}")
            continue
        
        # Scrape job listings
        job_data = scrape_job_data(main_driver)
        if not job_data:
            print(f"No job data found on page {page_num}.")
            continue
        
        # Get current job URLs for this page
        current_job_urls = set(job['Job URL'] for job in job_data if job['Job URL'] != 'N/A')
        
        # Compare with previous job URLs for this page
        if page_num in page_job_mapping:
            previous_job_urls = page_job_mapping[page_num]
            new_job_urls = current_job_urls - previous_job_urls
            
            if new_job_urls:
                print(f"🔔 Found {len(new_job_urls)} new job listings on page {page_num}!")
                
                # Filter job data to only include new jobs
                new_jobs = [job for job in job_data if job['Job URL'] in new_job_urls and job['Job URL'] not in processed_job_urls]
                
                if new_jobs:
                    print(f"Processing {len(new_jobs)} new jobs from page {page_num}...")
                    
                    # Process job details concurrently
                    process_new_jobs(driver_pool, new_jobs, mongo_collection, processed_job_urls)
                    
                    total_new_jobs += len(new_jobs)
            else:
                print(f"No new jobs found on page {page_num}")
        else:
            # This is a new page we haven't seen before
            print(f"New page {page_num} discovered. Processing all jobs...")
            new_jobs = [job for job in job_data if job['Job URL'] not in processed_job_urls and job['Job Title'] != 'N/A']
            
            if new_jobs:
                print(f"Processing {len(new_jobs)} new jobs from page {page_num}...")
                
                # Process job details concurrently
                process_new_jobs(driver_pool, new_jobs, mongo_collection, processed_job_urls)
                
                total_new_jobs += len(new_jobs)
        
        # Update the page job mapping
        page_job_mapping[page_num] = current_job_urls
        
        # Calculate and display the time taken for this check
        elapsed_time = time.time() - start_time
        print(f"Checked page {page_num} in {elapsed_time:.2f} seconds")
        
        # Brief pause between page checks
        time.sleep(2)
    
    return total_new_jobs

def process_new_jobs(driver_pool, new_jobs, mongo_collection, processed_job_urls):
    """Process new jobs concurrently and update the database."""
    with concurrent.futures.ThreadPoolExecutor(max_workers=len(driver_pool)) as executor:
        futures = []
        
        for job in new_jobs:
            futures.append(
                executor.submit(process_job_detail, driver_pool, job)
            )
        
        # Process results as they complete
        for i, future in enumerate(concurrent.futures.as_completed(futures)):
            try:
                job = future.result()
                print(f"Processed job {i+1}/{len(new_jobs)}: {job['Job Title']}")
                print_job_info(job)
                processed_job_urls.add(job['Job URL'])
                
                # Save job to MongoDB
                if mongo_collection is not None:
                    save_job_to_mongodb(mongo_collection, job)
            except Exception as e:
                print(f"Error processing job: {e}")

def check_for_new_pages(driver, current_max_pages):
    """Check if there are new pages beyond the current maximum."""
    # Try to load the next page after current_max_pages
    next_page = current_max_pages + 1
    url = f"https://internshala.com/jobs/page-{next_page}/"
    
    try:
        driver.get(url)
        # Wait briefly to see if job listings load
        try:
            WebDriverWait(driver, 10).until(
                EC.presence_of_all_elements_located((By.CLASS_NAME, 'individual_internship'))
            )
            # If we get here, the page loaded successfully
            # Recursively check for more pages
            return check_for_new_pages(driver, next_page)
        except:
            # No job listings found, so current_max_pages is still correct
            return current_max_pages
    except:
        # Error loading page, so current_max_pages is still correct
        return current_max_pages

if __name__ == "__main__":
    main()
