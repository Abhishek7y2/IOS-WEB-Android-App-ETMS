import subprocess
import time
import os
import shutil

DEVICE_ID = "E8197EA9-626D-4039-88A5-EC3B14DA690D"
BUNDLE_ID = "com.enterprise.workmate"

DEST_DIRS = [
    "/Users/ankur/Downloads/IOS WEB Employee Task Management System/Screenshots/IOS APP",
    "/Users/ankur/Downloads/IOS WEB Employee Task Management System/IOS app/Screenshots",
    "/Users/ankur/.gemini/antigravity-ide/brain/12e46e5b-1a79-4f95-b94b-dfd3f36ea6ba/Screenshots/IOS APP"
]

for d in DEST_DIRS:
    os.makedirs(d, exist_ok=True)

SCREENS = [
    ("01_iOS_Login_Screen.png", ["-screen", "login"]),
    ("02_iOS_Register_Screen.png", ["-screen", "register"]),
    ("03_iOS_Forgot_Password_Screen.png", ["-screen", "forgotpassword"]),
    ("04_iOS_Dashboard_Screen.png", ["-autologin", "-screen", "dashboard"]),
    ("05_iOS_Tasks_Screen.png", ["-autologin", "-screen", "tasks"]),
    ("06_iOS_Team_Directory_Screen.png", ["-autologin", "-screen", "employees"]),
    ("07_iOS_Leave_Portal_Screen.png", ["-autologin", "-screen", "leave"]),
    ("08_iOS_More_Menu_Screen.png", ["-autologin", "-screen", "more"]),
    ("09_iOS_Attendance_Clock_Screen.png", ["-autologin", "-screen", "attendance"]),
    ("10_iOS_Calendar_Holidays_Screen.png", ["-autologin", "-screen", "calendar"]),
    ("11_iOS_Messages_Inbox_Screen.png", ["-autologin", "-screen", "messages"]),
    ("12_iOS_Profile_Screen.png", ["-autologin", "-screen", "profile"]),
    ("13_iOS_Archive_Screen.png", ["-autologin", "-screen", "archive"]),
    ("14_iOS_Notifications_Screen.png", ["-autologin", "-screen", "notifications"]),
    ("15_iOS_Create_Task_Sheet.png", ["-autologin", "-screen", "createtask"]),
    ("16_iOS_Apply_Leave_Sheet.png", ["-autologin", "-screen", "applyleave"]),
    ("17_iOS_Compose_Message_Sheet.png", ["-autologin", "-screen", "composemessage"]),
]

temp_shot = "/tmp/sim_screen_temp.png"

for filename, args in SCREENS:
    print(f"Capturing: {filename} with args: {args}...")
    subprocess.run(["xcrun", "simctl", "terminate", DEVICE_ID, BUNDLE_ID], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(0.5)
    
    cmd = ["xcrun", "simctl", "launch", DEVICE_ID, BUNDLE_ID] + args
    subprocess.run(cmd, check=True)
    time.sleep(2.5)
    
    # Take screenshot
    subprocess.run(["xcrun", "simctl", "io", DEVICE_ID, "screenshot", temp_shot], check=True)
    
    # Copy to all target directories
    for d in DEST_DIRS:
        dest_path = os.path.join(d, filename)
        shutil.copyfile(temp_shot, dest_path)
        print(f" -> Saved to: {dest_path}")

print("All iOS App screenshots captured successfully!")
