import time
import json
import os
import platform
import sys
import subprocess
import pkg_resources
import undetected_chromedriver as uc
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import urllib.parse
import re
import threading
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException, NoSuchElementException


# Optimized dependency check to run only when needed
def check_and_update_dependencies(force_check=False, auto_update=False, fast_mode=False):
    """
    Check if undetected-chromedriver and selenium are up-to-date and update if needed.
    
    Args:
        force_check (bool): Whether to force the dependency check
        auto_update (bool): Whether to update packages automatically without confirmation
        fast_mode (bool): Use a faster but less thorough version check
    
    Returns:
        bool: True if dependencies are up-to-date or successfully updated, False otherwise.
    """
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

def create_chrome_driver(use_profile=True, headless=False):
    """
    Create an undetected Chrome driver with options that avoid security warnings.
    
    Args:
        use_profile (bool): Whether to use a persistent Chrome profile.
        headless (bool): Whether to run Chrome in headless mode.
        
    Returns:
        driver: Configured undetected Chrome webdriver.
    """
    # Use undetected-chromedriver's ChromeOptions
    options = uc.ChromeOptions()
    
    # Create a user data directory for persistent sessions
    if use_profile:
        system = platform.system()
        home_dir = os.path.expanduser("~")
        
        if system == "Windows":
            profile_dir = os.path.join(home_dir, "AppData", "Local", "internshala_selenium_profile")
        elif system == "Darwin":  # macOS
            profile_dir = os.path.join(home_dir, "Library", "Application Support", "internshala_selenium_profile")
        else:  # Linux and others
            profile_dir = os.path.join(home_dir, ".config", "internshala_selenium_profile")
        
        # Ensure the directory exists
        os.makedirs(profile_dir, exist_ok=True)
        
        options.add_argument(f"--user-data-dir={profile_dir}")
        options.add_argument("--profile-directory=Default")
    
    # Performance optimizations
    options.add_argument("--start-maximized")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--disable-extensions")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-infobars")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-browser-side-navigation")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-features=IsolateOrigins,site-per-process")
    options.add_argument("--disable-web-security")
    options.add_argument("--disable-popup-blocking")
    options.add_argument("--ignore-certificate-errors")
    options.add_argument("--enable-javascript")
    
    # Speed optimizations
    options.add_argument("--dns-prefetch-disable")
    options.add_argument("--no-first-run")
    options.add_argument("--no-default-browser-check")
    options.add_argument("--disable-client-side-phishing-detection")
    options.add_argument("--disable-sync")
    options.add_argument("--disable-background-networking")
    options.add_argument("--disable-default-apps")
    options.add_argument("--disable-background-timer-throttling")
    options.add_argument("--disable-backgrounding-occluded-windows")
    options.add_argument("--disable-renderer-backgrounding")
    options.add_argument("--disable-hang-monitor")
    
    # Handling of iframe cookie issues and resource scheduling
    options.add_argument("--enable-features=NetworkServiceInProcess")
    options.add_argument("--disable-features=NetworkService")
    options.add_argument("--allow-running-insecure-content")
    
    # Set a recent user agent
    options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/120.0.0.0 Safari/537.36")
    
    # Disable automation flags
    options.add_argument("--disable-automation")
    options.add_argument("--disable-blink-features=AutomationControlled")
    
    # Optional headless mode
    if headless:
        options.add_argument("--headless=new")
    
    # Create the driver using undetected-chromedriver
    try:
        driver = uc.Chrome(
            options=options,
            use_subprocess=True,  # Use a subprocess to help avoid detection
            driver_executable_path=None  # Let undetected-chromedriver handle this
        )
    except Exception as e:
        print(f"❌ Error creating Chrome driver: {e}")
        print("\nPossible issues:")
        print("1. Chrome browser version mismatch with chromedriver")
        print("2. Chrome browser needs to be updated")
        print("3. Selenium or undetected-chromedriver needs to be updated")
        print("\nTrying to fix automatically...")
        
        # Try to force-update the chromedriver
        try:
            driver = uc.Chrome(
                options=options,
                use_subprocess=True,
                driver_executable_path=None,
                force_update=True  # Force update the chromedriver
            )
            print("✅ Successfully created Chrome driver after forcing update!")
        except Exception as e2:
            print(f"❌ Still failed after attempted fix: {e2}")
            print("\nPlease try these manual steps:")
            print("1. Update Chrome browser to the latest version")
            print("2. Run: pip install --upgrade undetected-chromedriver selenium")
            print("3. Restart your computer and try again")
            raise
    
    # Execute a script to override common automation properties
    driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
        "source": """
        // Override the 'webdriver' property to return undefined
        Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
        
        // Add fake plugins array
        Object.defineProperty(navigator, 'plugins', {
            get: function() {
                return [
                    {description: "PDF Viewer", filename: "internal-pdf-viewer", name: "Chrome PDF Viewer"},
                    {description: "Chrome PDF Viewer", filename: "internal-pdf-viewer", name: "Chrome PDF Plugin"},
                    {description: "Native Client", filename: "internal-nacl-plugin", name: "Native Client"}
                ];
            }
        });
        
        // Set standard languages
        Object.defineProperty(navigator, 'languages', {get: function() { return ['en-US', 'en']; }});
        
        // Create fake chrome object
        window.chrome = {
            runtime: {}, 
            loadTimes: function() {}, 
            csi: function() {}, 
            app: {}
        };
        
        // Override permissions API if present
        if (navigator.permissions) {
            navigator.permissions.query = (parameters) => {
                return Promise.resolve({state: 'granted', onchange: null});
            };
        }
        
        // Override user agent data when available
        if (navigator.userAgentData) {
            Object.defineProperty(navigator, 'userAgentData', {
                get: () => {
                    return {
                        brands: [
                            {brand: 'Google Chrome', version: '120'},
                            {brand: 'Chromium', version: '120'}
                        ],
                        mobile: false,
                        platform: 'Windows'
                    };
                }
            });
        }
        """
    })
    
    return driver

def save_cookies_to_mongodb(cookies, email=None, name=None, is_verified=False, rating=None, extraction_url=None):
    """
    Save the cookies to MongoDB.
    
    Args:
        cookies (list): List of cookie dictionaries.
        email (str): User's email address.
        name (str): User's name.
        is_verified (bool): Whether the user has a verification badge.
        rating (str): User's rating.
        extraction_url (str): The URL from which cookies were extracted.
        
    Returns:
        bool: True if successful, False otherwise.
    """
    try:
        # Check if config file exists, otherwise create one with default values
        config_file = 'mongodb_config.json'
        if not os.path.exists(config_file):
            default_config = {
                "username": "thedevelites",
                "password": "rahulshivamgdg2025",
                "cluster": "cluster.wltaw.mongodb.net",
                "database": "internshala_db",
                "collection": "cookies"
            }
            with open(config_file, 'w') as f:
                json.dump(default_config, f, indent=4)
            print(f"Created MongoDB config file: {config_file}")
            print("Please verify the credentials in this file and run the script again.")
        
        # Load config
        with open(config_file, 'r') as f:
            config = json.load(f)
        
        # URL encode username and password from config
        username = urllib.parse.quote_plus(config["username"])
        password = urllib.parse.quote_plus(config["password"])
        cluster = config["cluster"]
        database = config["database"]
        collection = config["collection"]
        
        # Build connection string
        uri = f"mongodb+srv://{username}:{password}@{cluster}/?retryWrites=true&w=majority&appName=Cluster"
        
        print(f"Connecting to MongoDB...")
        
        # Create a new client and connect to the server
        client = MongoClient(uri, server_api=ServerApi('1'), connectTimeoutMS=5000, socketTimeoutMS=5000)
        
        # Send a ping to confirm a successful connection
        client.admin.command('ping')
        print("Connected to MongoDB")
        
        # Select database and collection
        db = client[database]
        cookies_collection = db[collection]
        
        # Create cookie string in the same format as terminal output
        cookie_string = ';'.join([f"{cookie['name']}={cookie['value']}" for cookie in cookies])
        
        # Create a document to insert
        cookie_document = {
            'timestamp': time.time(),
            'date': time.strftime('%Y-%m-%d %H:%M:%S'),
            'cookie_string': cookie_string,  # Store the formatted cookie string
            'cookies': cookies,  # Store the original cookie list for reference
            'email': email,  # Store the user's email
            'name': name,  # Store the user's name
            'is_verified': is_verified,  # Store whether the user has a verification badge
            'rating': rating,  # Store the user's rating
            'source': 'dropdown_menu',  # Indicate where the data was extracted from
            'extraction_url': extraction_url  # Store the URL from which cookies were extracted
        }
        
        # Insert the document
        result = cookies_collection.insert_one(cookie_document)
        print(f"Cookies stored in MongoDB with ID: {result.inserted_id}")
        
        return True
    
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        # Save to local file as fallback
        with open('cookies_backup.json', 'w') as f:
            json.dump({
                'cookie_string': ';'.join([f"{cookie['name']}={cookie['value']}" for cookie in cookies]),
                'cookies': cookies,
                'email': email,
                'name': name,
                'is_verified': is_verified,
                'rating': rating,
                'extraction_url': extraction_url,
                'timestamp': time.time(),
                'date': time.strftime('%Y-%m-%d %H:%M:%S')
            }, f, indent=4)
        print("Cookies saved to local backup file as fallback")
        
        return False

def extract_cookies_from_dashboard(url="https://internshala.com/student/dashboard", quick_mode=True, timeout=600):
    """
    Extract cookies from Internshala dashboard or personal details page after user logs in.
    
    Args:
        url (str): The dashboard URL to extract cookies from.
        quick_mode (bool): If True, extract cookies immediately when dashboard is detected.
        timeout (int): Maximum time to wait for login in seconds.
        
    Returns:
        tuple: (cookie_string, driver) - formatted cookie string and the browser instance.
    """
    # Initialize the Chrome driver with enhanced options
    driver = create_chrome_driver(use_profile=True)
    
    # Navigate to the Internshala homepage so the user can log in
    driver.get("https://internshala.com/")
    
    print("\n=== INTERNSHALA COOKIE EXTRACTOR ===")
    print("Please log in to your Internshala account manually.")
    print("This script will automatically extract cookies once you reach the dashboard.")
    print("======================================\n")
    
    # Wait for user to manually log in and reach dashboard
    logged_in = False
    start_time = time.time()
    
    # Set up wait
    wait = WebDriverWait(driver, 2)  # 2 second timeout for each check
    
    while not logged_in:
        current_url = driver.current_url
        
        # Check for various logged-in URLs
        if any(url_part in current_url for url_part in [
            "student/dashboard", 
            "student/personal_details", 
            "student/applications",
            "student/resume",
            "internships/matching-preferences"
        ]):
            logged_in = True
            print("✅ Detected logged-in state!")
        
        # Special check for jobs page - check for profile container element
        elif "internshala.com/jobs" in current_url:
            try:
                # Check if profile container element exists (indicates logged in)
                profile_elements = driver.find_elements(By.CSS_SELECTOR, ".profile_container")
                if profile_elements:
                    logged_in = True
                    print("✅ Detected logged-in state on jobs page!")
            except Exception as e:
                pass  # Continue waiting if element check fails
        
        if time.time() - start_time > timeout:
            print("❌ Login timeout exceeded. Please run the script again.")
            driver.quit()
            return None, None
            
        if not logged_in:
            # Wait a short time before checking again
            time.sleep(0.3)
    
    # User has reached dashboard or personal details page
    print(f"\n✅ Logged in successfully! Current page: {current_url}")
    
    # Very short delay for cookies to settle
    time.sleep(0.25)
    
    # Extract user information from the dashboard - optimized version
    user_info = extract_user_info(driver)
    email = user_info.get('email')
    name = user_info.get('name')
    is_verified = user_info.get('is_verified', False)
    rating = user_info.get('rating')
    
    # Retrieve the cookies from the browser
    cookies = driver.get_cookies()
    cookie_string = ';'.join([f"{cookie['name']}={cookie['value']}" for cookie in cookies])
    
    # Save cookies to JSON and text files for later use
    with open('cookies.json', 'w') as f:
        json.dump(cookies, f, indent=4)
    
    with open('cookies.txt', 'w') as f:
        f.write(cookie_string)
    
    print(f"\n✅ Successfully extracted cookies from: {driver.current_url}")
    print("📄 Cookies saved to cookies.json and cookies.txt")
    
    # Store cookies in MongoDB with user information
    save_cookies_to_mongodb(cookies, email, name, is_verified, rating, driver.current_url)
    
    # Check if we're on the personal details page
    is_personal_details_page = "personal_details" in current_url
    
    if is_personal_details_page:
        print("\nDetected personal details page - keeping browser open.")
        print("Please close the browser manually when you are done.")
        return cookie_string, driver
        
    return cookie_string, driver

def extract_user_info(driver):
    """
    Extract user information from the Internshala dashboard using optimized methods.
    
    Args:
        driver: Selenium WebDriver instance
        
    Returns:
        dict: Dictionary with user information
    """
    result = {
        'email': None,
        'name': None,
        'is_verified': False,
        'rating': None
    }
    
    # Fast extraction through JavaScript - single call approach
    try:
        # Execute JavaScript to find and extract all profile info at once
        script_result = driver.execute_script("""
            // Helper function to safely get text from an element
            function getText(selector) {
                const el = document.querySelector(selector);
                return el ? el.textContent.trim() : null;
            }
            
            // Open profile dropdown if it exists and is not already open
            const profileDropdown = document.querySelector('.profile_container');
            if (profileDropdown) {
                // Force show any hidden dropdown
                const dropdownMenu = document.querySelector('#profile-dropdown');
                if (dropdownMenu) {
                    dropdownMenu.style.display = 'block';
                }
            }
            
            // Extract all required info at once
            return {
                name: getText('.profile_name span') || getText('.dash_student_name'),
                email: getText('.profile_email'),
                rating: (document.querySelector('.rating span') || {textContent: null}).textContent.trim(),
                isVerified: document.querySelector('#verified_student_badge') !== null
            };
        """)
        
        if script_result:
            if script_result.get('name'):
                result['name'] = script_result['name']
            if script_result.get('email'):
                result['email'] = script_result['email']
            if script_result.get('rating'):
                result['rating'] = script_result['rating']
            if 'isVerified' in script_result:
                result['is_verified'] = script_result['isVerified']
    
    except Exception as e:
        print(f"JavaScript extraction failed: {e}")
    
    # If JavaScript extraction didn't work completely, try DOM and regex methods
    if not all([result['name'], result['email']]):
        try:
            # Check if we're on jobs page with different profile structure
            current_url = driver.current_url
            is_jobs_page = "internshala.com/jobs" in current_url
            
            # Force profile dropdown open if it exists
            if is_jobs_page:
                # Jobs page has a different dropdown structure
                driver.execute_script("""
                    const profileContainers = document.querySelectorAll('.profile_container_hover');
                    for (let el of profileContainers) {
                        try { el.click(); } catch(e) {}
                    }
                    const dropdowns = document.querySelectorAll('#profile-dropdown');
                    for (let dropdown of dropdowns) {
                        dropdown.style.display = 'block';
                    }
                """)
            else:
                driver.execute_script("""
                    const profileContainers = document.querySelectorAll('.profile_container');
                    for (let el of profileContainers) {
                        try { el.click(); } catch(e) {}
                    }
                    const dropdowns = document.querySelectorAll('#profile-dropdown');
                    for (let dropdown of dropdowns) {
                        dropdown.style.display = 'block';
                    }
                """)
            
            # Quick selenium checks for the most important elements
            if not result['name']:
                try:
                    name_el = driver.find_element(By.CSS_SELECTOR, '.profile_name span')
                    result['name'] = name_el.text.strip()
                except (NoSuchElementException, TimeoutException):
                    pass
                    
            if not result['email']:
                try:
                    email_el = driver.find_element(By.CSS_SELECTOR, '.profile_email')
                    result['email'] = email_el.text.strip() 
                except (NoSuchElementException, TimeoutException):
                    pass
            
            # As a last resort, try to extract from page source with optimized regex
            if not result['name'] or not result['email']:
                page_source = driver.page_source
                
                # Optimized extraction with simpler patterns
                if not result['name']:
                    name_match = re.search(r'class="profile_name"[^>]*>.*?<span>([^<]+)</span>', page_source)
                    if name_match:
                        result['name'] = name_match.group(1).strip()
                
                if not result['email']:
                    email_match = re.search(r'class="profile_email"[^>]*>([^<]+)</div>', page_source)
                    if email_match:
                        result['email'] = email_match.group(1).strip()
                    else:
                        # Look for email pattern
                        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
                        emails = re.findall(email_pattern, page_source)
                        if emails:
                            for potential_email in emails:
                                if not any(domain in potential_email.lower() for domain in ["@example", "@test", "@internshala", "@site"]):
                                    result['email'] = potential_email
                                    break
        except Exception as e:
            print(f"DOM extraction fallback failed: {e}")
    
    # Print found information
    print("\nExtracted user information:")
    if result['name']:
        print(f"Name: {result['name']}")
    if result['email']:
        print(f"Email: {result['email']}")
    if result['rating']:
        print(f"Rating: {result['rating']}")
    print(f"Verified: {'Yes' if result['is_verified'] else 'No'}")
    
    return result

def use_cookies_for_login(cookie_string, url="https://internshala.com/student/dashboard"):
    """
    Log into Internshala using previously saved cookies.
    
    Args:
        cookie_string (str): Cookie string in format "name1=value1; name2=value2".
        url (str): The URL to navigate to after setting cookies.
        
    Returns:
        driver: Selenium webdriver instance with cookies set.
    """
    driver = create_chrome_driver(use_profile=True)
    
    # First navigate to Internshala domain to set cookies
    driver.get("https://internshala.com/")
    
    # Parse the cookie string and add cookies to the session
    cookies_list = cookie_string.split(';')
    for cookie_item in cookies_list:
        if '=' in cookie_item:
            name, value = cookie_item.split('=', 1)
            try:
                driver.add_cookie({'name': name.strip(), 'value': value.strip(), 'domain': '.internshala.com'})
            except Exception:
                pass  # Ignore cookie errors, try to continue
    
    # Navigate to the dashboard with cookies set
    driver.get(url)
    return driver

def load_cookies_from_file(filename="cookies.txt"):
    """
    Load cookies from a text file.
    
    Args:
        filename (str): Path to the cookie file.
        
    Returns:
        str: The cookie string.
    """
    try:
        with open(filename, 'r') as f:
            return f.read().strip()
    except FileNotFoundError:
        print(f"Cookie file {filename} not found.")
        return None

def extract_cookies_for_api(callback=None):
    """
    Extract cookies from Internshala for API usage with callback support.
    
    Args:
        callback (function): Optional callback function to receive cookies data
        
    Returns:
        dict: Dictionary containing cookies and user information
    """
    # Initialize the Chrome driver with enhanced options
    driver = create_chrome_driver(use_profile=True)
    
    # Navigate to the Internshala homepage so the user can log in
    driver.get("https://internshala.com/")
    
    print("\n=== INTERNSHALA COOKIE EXTRACTOR API MODE ===")
    print("Please log in to your Internshala account in the popup window.")
    
    # Wait for user to manually log in and reach dashboard
    logged_in = False
    start_time = time.time()
    timeout = 600  # 10 minutes
    
    while not logged_in:
        time.sleep(0.3)  # Reduced polling interval for faster detection
        current_url = driver.current_url
        
        # Check for various logged-in URLs
        if any(url_part in current_url for url_part in [
            "student/dashboard", 
            "student/personal_details", 
            "student/applications",
            "student/resume"
        ]):
            logged_in = True
            print("Detected logged-in state!")
        
        if time.time() - start_time > timeout:
            print("Login timeout exceeded.")
            driver.quit()
            result = {
                "success": False,
                "error": "Login timeout exceeded"
            }
            if callback:
                callback(result)
            return result
    
    # User has reached dashboard or personal details page
    print(f"\nLogged in successfully! Current page: {current_url}")
    
    # Small delay for cookies to settle
    time.sleep(0.25)
    
    # Extract user information from the dashboard - use the optimized function
    user_info = extract_user_info(driver)
    
    # Retrieve the cookies from the browser
    cookies = driver.get_cookies()
    cookie_string = ';'.join([f"{cookie['name']}={cookie['value']}" for cookie in cookies])
    
    # Save cookies to MongoDB with user information
    save_cookies_to_mongodb(
        cookies, 
        user_info.get('email'), 
        user_info.get('name'), 
        user_info.get('is_verified', False), 
        user_info.get('rating'), 
        driver.current_url
    )
    
    # Close the browser
    driver.quit()
    
    # Prepare result object
    result = {
        "success": True,
        "cookies": cookies,
        "cookie_string": cookie_string,
        "user_info": user_info
    }
    
    # Call the callback function if provided
    if callback:
        callback(result)
    
    return result

def extract_cookies_in_background(callback=None):
    """
    Run cookie extraction in a background thread and return immediately.
    
    Args:
        callback (function): Function to call with results when complete
        
    Returns:
        threading.Thread: The background thread object
    """
    thread = threading.Thread(target=extract_cookies_for_api, args=(callback,))
    thread.daemon = True
    thread.start()
    return thread

if __name__ == "__main__":
    import sys
    
    # Set default options - use fast dependency checking by default
    check_deps = True
    fast_mode = True
    auto_update = True  # Auto-update dependencies without prompting
    
    # Parse command line options for speed optimization
    if len(sys.argv) > 1:
        # Skip dependency check entirely for "fast" command
        if sys.argv[1] == "fast":
            check_deps = False
        # Fast dependency checking for most commands
        elif sys.argv[1] in ["help", "--help", "-h", "update"]:
            fast_mode = False  # Thorough check for update command
            
    # Run dependency check if needed
    if check_deps:
        check_and_update_dependencies(fast_mode=fast_mode, auto_update=auto_update)
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "help" or sys.argv[1] == "--help" or sys.argv[1] == "-h":
            print("\n=== INTERNSHALA COOKIE EXTRACTOR HELP ===")
            print("Usage:")
            print("  python without_docker_extract.py         - Extract cookies (default)")
            print("  python without_docker_extract.py fast    - Extract cookies in fast mode (skip dependency check)")
            print("  python without_docker_extract.py personal - Extract cookies from personal details page")
            print("  python without_docker_extract.py use     - Login using saved cookies (dashboard)")
            print("  python without_docker_extract.py use personal - Login using saved cookies (personal details page)")
            print("  python without_docker_extract.py db      - Save existing cookies to MongoDB")
            print("  python without_docker_extract.py testdb  - Test MongoDB connection")
            print("  python without_docker_extract.py update  - Check and update dependencies only")
            print("  python without_docker_extract.py help    - Show this help message")
            print("======================================")
            sys.exit(0)
        
        if sys.argv[1] == "update":
            # Only check and update dependencies
            check_and_update_dependencies(force_check=True)
            sys.exit(0)
            
        if sys.argv[1] == "personal":
            # Extract cookies with personal details page as target
            print("Targeting personal details page - browser will remain open.")
            cookies, driver = extract_cookies_from_dashboard(url="https://internshala.com/student/personal_details?referral=dashboard", quick_mode=True)
            if cookies:
                print("\nExtracted cookies:")
                print(cookies)
                print("\nBrowser remains open because you are on the personal details page.")
                print("Close the browser manually when you are done.")
                print("NOTE: If you navigate to the dashboard, the browser will close automatically.")
                
                # Monitor for navigation to dashboard page
                try:
                    while True:
                        time.sleep(0.5)  # Reduced polling interval
                        current_url = driver.current_url
                        if ("student/dashboard" in current_url and "personal_details" not in current_url) or \
                           "internshala.com/jobs/matching-preferences" in current_url or \
                           "internshala.com/jobs/" in current_url or \
                           "internshala.com/internships/matching-preferences" in current_url:
                            print(f"\nDetected navigation to {current_url}. Closing browser automatically...")
                            driver.quit()
                            break
                except Exception as e:
                    print(f"Error while monitoring URL changes: {e}")
            
            sys.exit(0)
            
        if sys.argv[1] == "use":
            # Use previously saved cookies for login.
            cookie_string = load_cookies_from_file()
            if cookie_string:
                print("Using saved cookies to login directly...")
                # Check if a specific URL was provided as the third argument
                target_url = "https://internshala.com/student/dashboard"
                if len(sys.argv) > 2 and sys.argv[2] == "personal":
                    target_url = "https://internshala.com/student/personal_details?referral=dashboard"
                    print(f"Navigating to personal details page: {target_url}")
                
                driver = use_cookies_for_login(cookie_string, target_url)
                print("Successfully logged in. The browser will remain open with your session.")
                print("Close the browser manually when you're done.")
            else:
                print("No saved cookies found. Run the script without arguments to extract cookies first.")
        elif sys.argv[1] == "db":
            # Just load and save existing cookies to the database
            try:
                with open('cookies.json', 'r') as f:
                    cookies = json.load(f)
                # We don't have user info in this case, so we pass None/default values
                save_cookies_to_mongodb(cookies, extraction_url="manual_upload")
                print("Existing cookies loaded from file and saved to MongoDB.")
            except FileNotFoundError:
                print("No saved cookies found. Run the script without arguments to extract cookies first.")
    else:
        # Default: Extract cookies with fast mode
        cookies, driver = extract_cookies_from_dashboard(quick_mode=True)
        
        if cookies:
            print("\nExtracted cookies:")
            print(cookies)
            
            # Check if browser is still open due to personal details page
            if "personal_details" in driver.current_url:
                print("\nBrowser remains open because you are on the personal details page.")
                print("Close the browser manually when you're done.")
                print("NOTE: If you navigate to the dashboard, the browser will close automatically.")
                
                # Monitor for navigation to dashboard page
                try:
                    while True:
                        time.sleep(0.5)  # Reduced polling interval
                        current_url = driver.current_url
                        if ("student/dashboard" in current_url and "personal_details" not in current_url) or \
                           "internshala.com/jobs/matching-preferences" in current_url or \
                           "internshala.com/jobs/" in current_url or \
                           "internshala.com/internships/matching-preferences" in current_url:
                            print(f"\nDetected navigation to {current_url}. Closing browser automatically...")
                            driver.quit()
                            break
                except Exception as e:
                    print(f"Error while monitoring URL changes: {e}")
            else:
                print("\nTo use these cookies later, run: python without_docker_extract.py use")
