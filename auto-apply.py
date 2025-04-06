import os
import time
import json
import re
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from openai import OpenAI

# URL to open
url = "https://internshala.com/student/interstitial/application/work-from-home-ios-app-development-internship-at-go-eleventh-mile-technologies-private-limited1742554453"

# API keys collection
API_KEYS = {
    "Key 1": "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",
    "Key 2": "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",
    "Key 3": "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", 
    "Key 5": "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",
    "Default": "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"
}

# Track rate-limited keys to avoid using them
RATE_LIMITED_KEYS = set()

# Function to scrape resume details from Internshala
def scrape_resume_details(driver):
    resume_data = {}
    
    try:
        # Scrape personal details
        try:
            name_element = driver.find_element(By.CSS_SELECTOR, "#personal_details_name .full-name")
            resume_data["name"] = name_element.text.strip()
        except Exception as e:
            print(f"Error scraping name: {e}")
            resume_data["name"] = "Candidate"
        
        try:
            email_element = driver.find_element(By.CSS_SELECTOR, "#resume_email_id")
            resume_data["email"] = email_element.text.strip()
        except Exception:
            resume_data["email"] = ""
            
        # Scrape career objective
        try:
            career_objective = driver.find_element(By.CSS_SELECTOR, "#career_objective_542804_description")
            resume_data["career_objective"] = career_objective.text.strip()
        except Exception:
            resume_data["career_objective"] = ""
        
        # Scrape education
        education_list = []
        try:
            education_elements = driver.find_elements(By.CSS_SELECTOR, ".resume-education .detail_row")
            for edu in education_elements:
                education_text = edu.text.strip()
                if education_text:
                    education_list.append(education_text)
        except Exception:
            pass
        resume_data["education"] = education_list
        
        # Scrape work experience
        experience_list = []
        try:
            experience_elements = driver.find_elements(By.CSS_SELECTOR, ".resume-job .detail_row")
            for exp in experience_elements:
                experience_text = exp.text.strip()
                if experience_text:
                    experience_list.append(experience_text)
        except Exception:
            pass
        resume_data["experience"] = experience_list
        
        # Scrape skills
        skills_list = []
        try:
            skills_elements = driver.find_elements(By.CSS_SELECTOR, ".resume-skill .detail_row .line")
            for skill in skills_elements:
                skill_text = skill.text.strip()
                if skill_text:
                    skills_list.append(skill_text)
        except Exception:
            pass
        resume_data["skills"] = skills_list
        
        # Scrape projects
        projects_list = []
        try:
            project_elements = driver.find_elements(By.CSS_SELECTOR, ".resume-project .detail_row")
            for project in project_elements:
                project_text = project.text.strip()
                if project_text:
                    projects_list.append(project_text)
        except Exception:
            pass
        resume_data["projects"] = projects_list
        
        # Scrape additional details/accomplishments
        additional_list = []
        try:
            additional_elements = driver.find_elements(By.CSS_SELECTOR, ".resume-additional-detail .description")
            for add in additional_elements:
                add_text = add.text.strip()
                if add_text:
                    additional_list.append(add_text)
        except Exception:
            pass
        resume_data["accomplishments"] = additional_list
        
        print("Resume details scraped successfully!")
        return resume_data
        
    except Exception as e:
        print(f"Error scraping resume details: {e}")
        return {"name": "Candidate", "skills": [], "education": [], "experience": []}

# Function to get GPT-4o responses
def get_gpt4o_response(question, resume_data, job_title, company_name, key_name="Default"):
    # Create a list of keys to try, starting with the requested key
    keys_to_try = [key_name]
    
    # Add all other keys that aren't rate limited
    for key in API_KEYS:
        if key != key_name and key not in RATE_LIMITED_KEYS:
            keys_to_try.append(key)
    
    last_error = None
    
    # Try each key until one works
    for current_key in keys_to_try:
        api_key = API_KEYS.get(current_key)
        if not api_key:
            print(f"Error: Key '{current_key}' not found in API_KEYS")
            continue
            
        if current_key in RATE_LIMITED_KEYS:
            print(f"Skipping rate-limited key: {current_key}")
            continue
            
        try:
            print(f"Attempting to use API key: {current_key}")
            
            client = OpenAI(
                base_url="https://models.inference.ai.azure.com",
                api_key=api_key
            )
            
            # Format skills as a comma-separated list
            skills_text = ", ".join(resume_data.get("skills", []))
            
            # Format education and experience sections
            education_text = "\n- " + "\n- ".join(resume_data.get("education", [])) if resume_data.get("education") else ""
            experience_text = "\n- " + "\n- ".join(resume_data.get("experience", [])) if resume_data.get("experience") else ""
            
            # Get career objective
            career_objective = resume_data.get("career_objective", "")
            
            # Get accomplishments
            accomplishments = "\n- " + "\n- ".join(resume_data.get("accomplishments", [])) if resume_data.get("accomplishments") else ""
            
            # Check if this is a Yes/No radio button question
            is_yes_no_question = any(keyword in question.lower() for keyword in ["have you", "are you", "did you", "do you", "can you"])
            
            # Create a personalized dynamic prompt based on resume data
            prompt = f"""You are filling out a job application form for a {job_title} position at {company_name} on behalf of {resume_data.get('name', 'the candidate')}. 
Please provide a professional, positive and concise response to the following question: {question}

{"For Yes/No questions, ONLY respond with exactly 'Yes' or 'No' based on the candidate's profile." if is_yes_no_question else ""}

The response should be personalized based on the candidate's profile:

CANDIDATE PROFILE:
Name: {resume_data.get('name', '')}
Career Objective: {career_objective}

Skills: {skills_text}

Education: {education_text}

Work Experience: {experience_text}

Accomplishments: {accomplishments}

IMPORTANT: DO NOT include ANY formatting text such as "Here's a professional response..." or "This response highlights...". 
DO NOT include ANY introductory phrases or concluding remarks.
DO NOT include separator lines like "---".
Start your response with the actual content and end with the actual content.
{"If this is a Yes/No question, ONLY answer with 'Yes' or 'No'." if is_yes_no_question else ""}
Keep your response professional, concise, tailored to this specific job, and always frame the candidate's qualifications in a positive light. Highlight relevant skills and experiences that match the job requirements."""
            
            response = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="gpt-4o",
                temperature=0.7,
                max_tokens=4096,
                top_p=1
            )
            
            content = response.choices[0].message.content
            
            # Clean up the response by removing any common formatting patterns
            # Remove intro phrases like "Here's a professional response..."
            content = re.sub(r'^.*?(?:response|answer).*?(?:tailored|for|to).*?:\s*', '', content, flags=re.IGNORECASE|re.DOTALL)
            
            # Remove separator lines like "---"
            content = re.sub(r'^\s*-+\s*$', '', content, flags=re.MULTILINE)
            
            # Remove conclusion phrases like "This response highlights..."
            content = re.sub(r'\n\s*This response highlights.*$', '', content, flags=re.IGNORECASE|re.DOTALL)
            
            # Strip leading/trailing whitespace
            content = content.strip()
            
            print(f"Successfully used API key: {current_key}")
            return content
            
        except Exception as e:
            last_error = e
            error_str = str(e)
            
            # Check if the error is due to rate limiting
            if "RateLimitReached" in error_str or "Rate limit" in error_str or "429" in error_str:
                print(f"Rate limit reached for key '{current_key}'. Marking as rate limited.")
                RATE_LIMITED_KEYS.add(current_key)
                # Try the next key
                continue
            else:
                # If it's another type of error, print it but still try the next key
                print(f"Error with GPT-4o API using key '{current_key}': {e}")
                continue
    
    # If we've exhausted all keys without success
    if all(key in RATE_LIMITED_KEYS for key in API_KEYS):
        print("All API keys are rate-limited. Cannot proceed.")
        return "All API keys are rate-limited. Please try again later."
    
    # If we get here, all keys failed but not all are rate-limited
    print(f"Failed to get response with all available keys. Last error: {last_error}")
    return f"Error generating response. Last error: {last_error}"

# Setup Chrome WebDriver with persistent profile
print("Setting up the Chrome WebDriver with persistent profile...")

# Create a directory for the Chrome profile if it doesn't exist
profile_directory = os.path.join(os.path.dirname(os.path.abspath(__file__)), "chrome_profile")
if not os.path.exists(profile_directory):
    os.makedirs(profile_directory)
    print(f"Created new profile directory: {profile_directory}")
else:
    print(f"Using existing profile directory: {profile_directory}")

# Set up Chrome options for persistent profile
chrome_options = Options()
chrome_options.add_argument(f"user-data-dir={profile_directory}")

# Add options to fix the "Couldn't sign you in" error
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-blink-features=AutomationControlled")
chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
chrome_options.add_experimental_option("useAutomationExtension", False)

# Ensure browser doesn't close by adding detach option
chrome_options.add_experimental_option("detach", True)

# Add a user agent to make the browser appear more like a regular browser
chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36")

# Uncomment the line below if you want the browser to run in the background
# chrome_options.add_argument("--headless")

# Initialize the Chrome driver with options
driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install()),
    options=chrome_options
)

# Execute CDP command to disable automation flags further
driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
    "source": """
    Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined
    });
    """
})

try:
    # Open the URL
    print(f"Opening URL: {url}")
    driver.get(url)
    
    # Give some time for the page to load completely
    print("Waiting for page to load...")
    time.sleep(5)
    
    # --- New Code Block: Automatic Google Sign-In ---
    try:
        # Attempt to locate the Google sign-in button by its ID
        google_sign_in_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "google-login-or-register-link"))
        )
        if google_sign_in_button and google_sign_in_button.is_displayed():
            print("Google sign-in option detected. Attempting to sign in with Google...")
            google_sign_in_button.click()
            
            # Prompt the user to complete the sign-in manually
            print("\n========= ATTENTION REQUIRED =========")
            print("Please complete the Google sign-in process manually in the browser window.")
            print("You have 120 seconds to complete this process.")
            print("After logging in, type 'done' and press Enter to continue.")
            print("=======================================\n")
            
            # Start a timer
            login_timeout = 120  # 2 minutes to complete login
            start_login_time = time.time()
            
            # Create a loop that waits for either the user input or the "Proceed to application" button
            while time.time() - start_login_time < login_timeout:
                # Check if the "Proceed to application" button is already visible
                try:
                    proceed_button = WebDriverWait(driver, 1).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, "div.proceed-btn-container button.proceed-btn"))
                    )
                    print("Login completed automatically, proceeding...")
                    break
                except Exception:
                    pass
                
                # Check if we can get user input without blocking indefinitely
                import sys
                import select
                
                # Windows doesn't support select.select on sys.stdin
                # So we'll use a simple timeout approach for input
                import threading
                
                user_input = [None]
                
                def get_input():
                    user_input[0] = input()
                
                input_thread = threading.Thread(target=get_input)
                input_thread.daemon = True
                print("Type 'done' when you've completed login (or wait for automatic detection): ", end='', flush=True)
                input_thread.start()
                input_thread.join(5)  # Wait for 5 seconds for user input
                
                if user_input[0] is not None and user_input[0].strip().lower() == 'done':
                    print("User confirmed login completion.")
                    break
                
                # If we reach here, either no input was received or it wasn't 'done'
                # Continue the loop to check button again
            
            # Check if we timed out
            if time.time() - start_login_time >= login_timeout:
                print("Login timeout reached. Continuing with the script anyway...")
            
            print("Continuing with application process...")
    except Exception as e:
        print("Google sign-in was not performed (either not required or an error occurred):", e)
    # --- End of Google Sign-In block ---
    
    # --- New Code Block: Check if redirected to dashboard and navigate back to application ---
    current_url = driver.current_url
    if "dashboard" in current_url:
        print(f"Detected redirection to dashboard: {current_url}")
        print(f"Navigating back to application URL: {url}")
        driver.get(url)
        time.sleep(5)  # Wait for the page to load
    
    # Add a timeout mechanism to avoid infinite waiting
    max_wait_time = 45  # Maximum time to wait in seconds
    start_time = time.time()
    # --- End of Dashboard Redirect handling ---
    
    # Wait for the 'Proceed to application' button to be available
    print("Waiting for the 'Proceed to application' button to be available...")
    # Try multiple possible selectors with a longer timeout
    button_selectors = [
        "div.proceed-btn-container button.proceed-btn",
        "button.proceed-btn",
        "//button[contains(text(), 'Proceed to application')]",
        "//button[contains(@class, 'proceed-btn')]"
    ]
    
    proceed_button = None
    wait = WebDriverWait(driver, 30)  # Increased timeout to 30 seconds
    
    # Try each selector until one works or timeout
    while time.time() - start_time < max_wait_time:
        # Check if we're on the dashboard again (could happen after a refresh or redirect)
        if "dashboard" in driver.current_url:
            print(f"Detected dashboard page again: {driver.current_url}")
            print(f"Navigating back to application URL: {url}")
            driver.get(url)
            time.sleep(5)
        
        for selector in button_selectors:
            try:
                if selector.startswith("//"):
                    proceed_button = WebDriverWait(driver, 5).until(
                        EC.element_to_be_clickable((By.XPATH, selector))
                    )
                else:
                    proceed_button = WebDriverWait(driver, 5).until(
                        EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
                    )
                print(f"Found 'Proceed to application' button using selector: {selector}")
                break
            except Exception as e:
                print(f"Selector '{selector}' failed: {str(e)}")
        
        if proceed_button:
            break
        
        # If button not found and we're on an unexpected page, try to handle it
        if not proceed_button:
            print(f"Button not found. Current URL: {driver.current_url}")
            # If we're in any other page that is not the application page, go back to application URL
            if url not in driver.current_url and "interstitial/application" not in driver.current_url:
                print("Not on application page. Navigating back to application URL.")
                driver.get(url)
                time.sleep(5)
            else:
                print("Waiting a bit more for the button to appear...")
                time.sleep(5)
    
    if not proceed_button:
        # Take a screenshot to debug
        screenshot_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "debug_screenshot.png")
        driver.save_screenshot(screenshot_path)
        print(f"Button not found after {max_wait_time} seconds. Screenshot saved to {screenshot_path}")
        # Print page source for debugging
        with open("page_source.html", "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        print("Page source saved to page_source.html")
        raise Exception("Could not find the 'Proceed to application' button after maximum wait time")
    
    # Scrape resume details before clicking the button
    print("Scraping resume details from Internshala profile...")
    resume_data = scrape_resume_details(driver)
    print(f"Resume data scraped: {json.dumps(resume_data, indent=2)}")
    
    # Try to extract job title and company name from the page or URL
    job_title = "Unknown Position"
    company_name = "Company"
    
    try:
        # Try to extract from URL or page title
        url_parts = url.split("-at-")
        if len(url_parts) > 1:
            job_company_part = url_parts[-1].split("/")[0].split("?")[0]
            job_parts = url_parts[0].split("-")
            
            # Extract job title - take the last few words in the URL before "-at-"
            job_words = []
            for part in reversed(job_parts):
                if part not in ["internship", "job", "work", "from", "home"]:
                    job_words.insert(0, part)
                if len(job_words) >= 3:  # Take up to 3 words for job title
                    break
            job_title = " ".join(job_words).replace("-", " ").title()
            
            # Extract company name from the part after "-at-"
            company_name = job_company_part.replace("-", " ").title()
            
            print(f"Extracted job title: {job_title}")
            print(f"Extracted company name: {company_name}")
    except Exception as e:
        print(f"Error extracting job details from URL: {e}")
    
    # Click the button to go to the application form
    print("Clicking the 'Proceed to application' button...")
    driver.execute_script("arguments[0].scrollIntoView(true);", proceed_button)
    time.sleep(1)
    driver.execute_script("arguments[0].click();", proceed_button)
    
    # Wait for the application form to load
    print("Waiting for application form to load...")
    time.sleep(5)
    
    # Check for and close the resume creation popup if it appears
    try:
        popup_close_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "upload-resume-modal-close"))
        )
        if popup_close_button:
            print("Resume creation popup detected. Closing it...")
            driver.execute_script("arguments[0].click();", popup_close_button)
            print("Resume popup closed successfully.")
            time.sleep(2)  # Wait for popup to close
    except Exception as e:
        print("Resume creation popup not detected or already closed:", e)
    
    # Step 1: Scrape questions from the form
    print("Scraping questions from the form...")
    form_questions = {}
    question_labels = driver.find_elements(By.CSS_SELECTOR, "div.assessment_question label")
    for label in question_labels:
        question_text = label.text.strip()
        if question_text:
            print(f"Found question: {question_text}")
            form_questions[question_text] = None
    
    # Step 2: Generate answers using GPT-4o with personalized resume data
    print("Generating personalized answers using GPT-4o and resume data...")
    for question in form_questions:
        print(f"Generating answer for: '{question}'")
        form_questions[question] = get_gpt4o_response(question, resume_data, job_title, company_name)
        print(f"Answer generated successfully for: '{question}'")
    
    # Step 3: Fill in the answers
    print("Filling in the answers...")
    
    # Completely revised form filling based on HTML structure
    try:
        print("Using direct targeting based on HTML structure...")
        
        # Clear the form filling so far
        print("Step 1: Fill the cover letter")
        try:
            # First try to find the cover letter Quill editor
            cover_letter_editor = driver.find_element(By.CSS_SELECTOR, ".ql-editor")
            print("Found cover letter editor")
            
            # Get the answer for "Why should you be hired for this role?" or similar
            cover_letter_answer = None
            for question, answer in form_questions.items():
                if "why should you be hired" in question.lower() or "cover letter" in question.lower():
                    cover_letter_answer = answer
                    print(f"Using answer for '{question}' as cover letter")
                    break
            
            if not cover_letter_answer and form_questions:
                # Just use the first answer if we couldn't find a specific match
                cover_letter_answer = next(iter(form_questions.values()))
                print("Using first available answer as cover letter")
            
            if cover_letter_answer:
                # Sanitize the answer
                sanitized_answer = cover_letter_answer.replace('`', '\\`').replace("'", "\\'").replace('"', '\\"')
                
                # Fill the cover letter directly
                script = f"""
                arguments[0].innerHTML = `{sanitized_answer}`;
                var event = new Event('input', {{ bubbles: true }});
                arguments[0].dispatchEvent(event);
                """
                driver.execute_script(script, cover_letter_editor)
                print("Successfully filled cover letter editor")
                
                # Also update the hidden textarea if it exists
                try:
                    hidden_textarea = driver.find_element(By.ID, "cover_letter")
                    driver.execute_script(f"arguments[0].value = `{sanitized_answer}`;", hidden_textarea)
                    print("Also updated hidden cover letter textarea")
                except Exception as e:
                    print(f"Note: Could not update hidden cover letter textarea: {e}")
            else:
                print("Warning: No suitable answer found for cover letter")
        except Exception as e:
            print(f"Error filling cover letter: {e}")
        
        # Step 2: Fill the additional questions
        print("\nStep 2: Fill additional questions")
        
        # Find all textareas that begin with "custom_question_text_"
        additional_textareas = driver.find_elements(By.CSS_SELECTOR, "textarea[id^='custom_question_text_']")
        if additional_textareas:
            print(f"Found {len(additional_textareas)} additional question textareas")
            
            # Match each textarea to a question by looking at its container
            for i, textarea in enumerate(additional_textareas):
                try:
                    # Get the textarea ID
                    textarea_id = textarea.get_attribute("id")
                    print(f"Processing textarea with ID: {textarea_id}")
                    
                    # Find the closest assessment_question div
                    container_script = """
                    function getParentContainer(element) {
                        let current = element;
                        while (current && !current.querySelector('.assessment_question label')) {
                            current = current.parentElement;
                        }
                        return current;
                    }
                    return getParentContainer(arguments[0]);
                    """
                    container = driver.execute_script(container_script, textarea)
                    
                    if container:
                        # Get the question label
                        label_elem = container.find_element(By.CSS_SELECTOR, ".assessment_question label")
                        question_text = label_elem.text.strip()
                        print(f"Found question text: '{question_text}'")
                        
                        # Try to find this question in our answers
                        if question_text in form_questions:
                            answer = form_questions[question_text]
                            print(f"Found matching answer for question '{question_text}'")
                        else:
                            # If exact match not found, try partial match
                            matched_question = None
                            for q in form_questions:
                                # Check if label text contains question or vice versa
                                if question_text.lower() in q.lower() or q.lower() in question_text.lower():
                                    matched_question = q
                                    break
                            
                            if matched_question:
                                answer = form_questions[matched_question]
                                print(f"Found partial match: '{matched_question}' for question '{question_text}'")
                            else:
                                # If we still can't find a match, just use a generic answer
                                answer = "Yes, I confirm and meet all the requirements."
                                print(f"No match found for '{question_text}'. Using generic answer.")
                        
                        # Fill the textarea
                        textarea.clear()
                        textarea.send_keys(answer)
                        print(f"Successfully filled textarea for '{question_text}'")
                    else:
                        print(f"Could not find container for textarea {textarea_id}")
                except Exception as e:
                    print(f"Error processing additional textarea {i}: {e}")
        else:
            print("No additional question textareas found")
            
        # Handle radio button questions (Yes/No questions)
        print("\nHandling radio button questions (Yes/No)...")
        try:
            # Find all radio button groups
            radio_groups = driver.find_elements(By.CSS_SELECTOR, ".custom_question_boolean_container")
            if radio_groups:
                print(f"Found {len(radio_groups)} radio button groups")
                
                for i, radio_group in enumerate(radio_groups):
                    try:
                        # Find the parent container with the question
                        container_script = """
                        function getParentContainerWithQuestion(element) {
                            let current = element;
                            while (current && !current.querySelector('.assessment_question label')) {
                                current = current.parentElement;
                            }
                            return current;
                        }
                        return getParentContainerWithQuestion(arguments[0]);
                        """
                        container = driver.execute_script(container_script, radio_group)
                        
                        if container:
                            # Get the question label
                            label_elem = container.find_element(By.CSS_SELECTOR, ".assessment_question label")
                            question_text = label_elem.text.strip()
                            print(f"Found radio button question: '{question_text}'")
                            
                            # Check if we already have an answer for this question
                            answer = None
                            if question_text in form_questions:
                                answer = form_questions[question_text]
                                print(f"Using existing answer: '{answer}'")
                            else:
                                # Generate a Yes/No answer using GPT-4o
                                print(f"Generating Yes/No answer for '{question_text}'")
                                answer = get_gpt4o_response(question_text, resume_data, job_title, company_name)
                                form_questions[question_text] = answer
                                print(f"Generated answer: '{answer}'")
                            
                            # Parse the answer to determine Yes or No
                            # We'll consider the answer as "Yes" if it starts with "Yes" or contains positive keywords
                            is_yes = False
                            answer_lower = answer.lower()
                            if answer_lower.startswith("yes") or "yes" in answer_lower[:20]:
                                is_yes = True
                            
                            # Find the appropriate radio button
                            radio_inputs = radio_group.find_elements(By.CSS_SELECTOR, "input[type='radio']")
                            for radio in radio_inputs:
                                value = radio.get_attribute("value")
                                if (is_yes and value.lower() == "yes") or (not is_yes and value.lower() == "no"):
                                    print(f"Selecting '{value}' radio button")
                                    driver.execute_script("arguments[0].click();", radio)
                                    break
                    except Exception as e:
                        print(f"Error processing radio group {i}: {e}")
            else:
                print("No radio button groups found")
        except Exception as e:
            print(f"Error handling radio button questions: {e}")
        
        # Step 3: Ensure "Available immediately" is selected
        print("\nStep 3: Ensuring availability option is selected")
        try:
            available_immediately_radio = driver.find_element(By.ID, "radio1")
            if not available_immediately_radio.is_selected():
                driver.execute_script("arguments[0].click();", available_immediately_radio)
                print("Selected 'Available immediately' option")
            else:
                print("'Available immediately' option was already selected")
        except Exception as e:
            print(f"Error selecting availability: {e}")
        
        print("\nForm filling completed")
    except Exception as e:
        print(f"Error during form filling: {e}")
        
    # Take a screenshot for verification
    try:
        screenshot_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "form_filled_screenshot.png")
        driver.save_screenshot(screenshot_path)
        print(f"Form screenshot saved to {screenshot_path} for verification")
    except Exception as e:
        print(f"Failed to save form screenshot: {e}")
    
    # Wait for user to review before submission
    submit_confirm = input("Form is filled out. Press Enter to submit or type 'no' to just keep the browser open: ")
    if submit_confirm.lower() != "no":
        try:
            submit_button = driver.find_element(By.ID, "submit")
            driver.execute_script("arguments[0].click();", submit_button)
            print("Form submitted successfully!")
        except Exception as e:
            print(f"Error submitting form: {e}")
    else:
        print("Form not submitted. You can submit manually in the browser.")
    
    print("Application process automated successfully!")
    print("Browser will remain open after script ends.")
    
except Exception as e:
    print(f"Error: {e}")

print("Script completed. Browser will remain open.")
print("(You can close this terminal window, the browser will stay open)")

try:
    with open("internshala_questions.json", "w") as f:
        json.dump(form_questions, f, indent=4)
    print("Scraped questions saved to internshala_questions.json")
except Exception as e:
    print(f"Error saving questions: {e}")