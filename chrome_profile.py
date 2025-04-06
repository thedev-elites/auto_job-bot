import os
import subprocess
import sys
import time

def kill_chrome_processes(profile_path=None):
    """Kill Chrome processes, optionally filtering by profile path."""
    print(f"Attempting to close Chrome browser{'s using profile: ' + profile_path if profile_path else ''}")
    
    # Get list of Chrome processes
    try:
        # List all running chrome processes
        tasklist = subprocess.run(
            ["tasklist", "/FI", "IMAGENAME eq chrome.exe", "/FO", "CSV"],
            capture_output=True,
            text=True,
            check=True
        )
        
        if "chrome.exe" not in tasklist.stdout:
            print("No Chrome processes found.")
            return False
            
        # Kill all Chrome processes
        subprocess.run(
            ["taskkill", "/F", "/IM", "chrome.exe"],
            capture_output=True,
            check=False
        )
        
        print("Chrome processes terminated successfully.")
        return True
        
    except subprocess.SubprocessError as e:
        print(f"Error terminating Chrome processes: {e}")
        return False

def open_chrome_profile(profile_path):
    """Open Chrome with the specified profile."""
    try:
        # Check if Chrome exists in common locations
        chrome_paths = [
            r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
            os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe")
        ]
        
        chrome_exe = None
        for path in chrome_paths:
            if os.path.exists(path):
                chrome_exe = path
                break
        
        if not chrome_exe:
            print("Could not find Chrome executable. Please install Chrome or provide the correct path.")
            return False
        
        # Check if profile directory exists
        profile_dir = os.path.dirname(profile_path) if profile_path.endswith("Default") else profile_path
        if not os.path.exists(profile_dir):
            print(f"Profile directory {profile_dir} does not exist.")
            create_profile = input("Would you like to create this profile directory? (y/n): ")
            if create_profile.lower() == 'y':
                os.makedirs(profile_dir, exist_ok=True)
            else:
                return False
                
        # Launch Chrome with the specified profile
        cmd = [chrome_exe, f"--user-data-dir={profile_dir}"]
        print(f"Launching Chrome with profile: {profile_dir}")
        subprocess.Popen(cmd)
        return True
        
    except Exception as e:
        print(f"Error opening Chrome with profile: {e}")
        return False

if __name__ == "__main__":
    # Define available profiles
    profiles = {
        "1": r"C:\Users\Rose\Music\chrome_profile\Default",
        "2": r"C:\Users\Rose\AppData\Local\internshala_selenium_profile"
    }
    
    profile_path = None
    
    # Allow override from command line
    if len(sys.argv) > 1:
        profile_path = sys.argv[1]
    else:
        # Ask user which profile to use
        print("Available Chrome profiles:")
        for key, path in profiles.items():
            print(f"{key}: {path}")
        
        choice = input("Which profile would you like to use? (Enter number): ")
        if choice in profiles:
            profile_path = profiles[choice]
        else:
            print("Invalid selection. Using default profile.")
            profile_path = profiles["1"]
    
    action = "open"  # Default action
    if len(sys.argv) > 2:
        action = sys.argv[2].lower()
        
    if action == "close":
        kill_chrome_processes(profile_path)
        print(f"Chrome profile at {profile_path} should now be closed.")
    else:
        open_chrome_profile(profile_path)
