from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:5173/')

    # Login
    page.fill('input[type="email"]', 'admin@gurgil.com')
    page.fill('input[type="password"]', '123456')
    page.click('button[type="submit"]')
    page.wait_for_timeout(2000)

    # Go to Meeting Rooms page
    page.goto('http://localhost:5173/meeting-rooms')
    page.wait_for_timeout(3000)

    # Take screenshot
    page.screenshot(path='verification.png', full_page=True)

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
