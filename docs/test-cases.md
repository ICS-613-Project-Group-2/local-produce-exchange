**Green Beans \- Test Cases**

| Field | Example |
| ----- | ----- |
| Test case ID | TC-001 |
| Related story | Creat Account |
| Precondition | User is not logged in. Email does not exist. |
| Test data | New username, display name, email, password, and confirm password |
| Steps | 1\. Open sign up page 2\. Enter required fields 3\. Click Create Account |
| Expected result | Account is created successfully and user is redirected to Dashboard  |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-002 |
| Related story | Create Account |
| Precondition | User is not logged in. Email already exists. |
| Test data | Existing email: [test@hi.com](mailto:test@hi.com) Password:  |
| Steps | 1\. Open sign up page 2\. Enter an existing email 3\. Click Create Account |
| Expected result | Error message “Email already exists |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-003 |
| Related story | Create Account |
| Precondition | User is on the Sign Up page |
| Test data | Blank required fields |
| Steps | 1\. Leave required fields blank 2\. Click Create Account |
| Expected result | Validation messages are displayed for all required fields |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-004 |
| Related story | Log Into Account |
| Precondition | User account exists |
| Test data | Valid email and password |
| Steps | 1\. Open Login page 2\. Enter valid credentials 3\. Click Login |
| Expected result | User is authenticated and redirected to Dashboard |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-005 |
| Related story | Log Into Account |
| Precondition | User account exists |
| Test data | Valid email and password |
| Steps | 1\. Open Login page 2\. Enter incorrect password 3\. Click Login |
| Expected result | Error message “Invalid email or password” is displayed |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-006 |
| Related story | Reset Password |
| Precondition | User account exists |
| Test data | Registered email |
| Steps | 1\. Click Forgot Password 2\. Enter registered email 3\. Click Send Reset Link |
| Expected result | Password reset email is sent successfully |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-007 |
| Related story | Reset Password |
| Precondition | User has received a valid reset link |
| Test data | New password |
| Steps | 1\. Open reset link 2\. Enter new password 3\. Confirm password 4\. Submit |
| Expected result | Password is updated successfully and user can log in with the new password |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-008 |
| Related story | Reset Password |
| Precondition | Reset link has expired |
| Test data | Expired reset link |
| Steps | Open expired reset link |
| Expected result | System displays “Reset link has expired.” Password is not changed. |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-009 |
| Related story | View Landing Page |
| Precondition | User is not logged in |
| Test data | N/A |
| Steps | 1\. Open the Home page 2\. Click Sign Up |
| Expected result | User is redirected to the Sign Up page |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-010 |
| Related story | View Landing Page |
| Precondition | User is not logged in |
| Test data | N/A |
| Steps | 1\. Open the Home page 2\. Click Learn More |
| Expected result | User is redirected to the About page. About page loads successfully. |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-011 |
| Related story | View Landing Page |
| Precondition | User is not logged in |
| Test data | N/A |
| Steps | 1\. Open the Home page 2\. Click Log In |
| Expected result | User is redirected to the Login page |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-012 |
| Related story | View About Page |
| Precondition | User is on the About page |
| Test data | N/A |
| Steps | 1\. Verify page formatting and images 2\. Click the Sign Up button at the bottom |
| Expected result | User is redirected to the Sign Up page |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-013 |
| Related story | Browse Food Listings |
| Precondition | Food listings exist in the system |
| Test data | N/A |
| Steps | 1\. Log in to Green Beans 2\. Navigate to the Browse Listings page |
| Expected result | The Browse Listings page loads successfully and displays available listing cards |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-014 |
| Related story | Browse Food Listings |
| Precondition | Listings contain the keyword “Tomato” |
| Test data | Keyword: Tomato |
| Steps | 1\. Open the Browse Listings page 2\. Enter Tomato in the search bar 3\. Click Search |
| Expected result | Only listings containing “Tomato” are displayed |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-015 |
| Related story | Browse Food Listings |
| Precondition | Listings exist in multiple categories |
| Test data | Category: Vegetables |
| Steps | 1\. Open the Browse Listings page 2\. Click Vegetables from the category filter |
| Expected result | Only listings in the Vegetables category are displayed |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-016 |
| Related story | Browse Food Listings |
| Precondition | No listing matches the search keyword |
| Test data | Keyword: mushroom |
| Steps | 1\. Open the Browse Listings page. 2\.  Enter mushroom in the search bar 3\. Click Search |
| Expected result | The message “No listings found” is displayed |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-017 |
| Related story | Browse Food Listings |
| Precondition | Listings have different availability statuses. |
| Test data | Availability: Available, Expiring Soon |
| Steps | 1\. Open the Browse Listings page 2\. Select Expiring Soonest filter |
| Expected result | Listings with “Expiring Soon” status appear before other statuses |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-018 |
| Related story | Browse Food Listings |
| Precondition | User is on the Browse Listings page |
| Test data | N/A |
| Steps | Click Create Listing |
| Expected result | User is redirected to the Create Listing page |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-019 |
| Related story | Browse Food Listings |
| Precondition | User is on the Browse Listings page |
| Test data | N/A |
| Steps | Click View Details |
| Expected result | User is redirected to the Listing Detail page.  |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-020 |
| Related story | View Listing Details |
| Precondition | One food listing exists |
| Test data | Sample listing |
| Steps | Open a listing |
| Expected result | The following items are displayed correctly: Produce image Listing description Quantity Category Pickup details Expiration date Owner information Status |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-021 |
| Related story | View Listing Details |
| Precondition | One food listing exists |
| Test data | Sample listing |
| Steps | 1\. Open a listing 2\. Click Edit Listing |
| Expected result | User is redirected to the Edit Listing page. |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-022 |
| Related story | View Listing Details |
| Precondition | The selected listing has been deleted or no longer exists |
| Test data | Deleted listing ID |
| Steps | Attempt to open the deleted listing using its URL |
| Expected result | “Listing Not Found” is displayed |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-023 |
| Related story | View Listing Details  |
| Precondition | One food listing exists |
| Test data | Sample listing |
| Steps | 1\. Open a listing 2\. Click Message Owner |
| Expected result | User is redirect to the Messages page. |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-024 |
| Related story | View Listing Details  |
| Precondition | One food listing exists |
| Test data | Sample listing |
| Steps | 1\. Open a listing 2\. Click Submit Claim Request |
| Expected result | A "Claim request submitted" success message is displayed. Clicking "Go to Messages" opens the newly created conversation associated with the claim request. |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-025 |
| Related story | View Listing Details  |
| Precondition | One food listing exists |
| Test data | Listing ID: 1 |
| Steps | 1\. Open a listing 2\. Enter 10 and Click Submit Claim Request |
| Expected result | The error message indicates that the number cannot exceed 5\. |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-026 |
| Related story | Create Listing |
| Precondition | User is logged in. |
| Test data | Produce: Mushroom Category: Vegetables Quantity: 10 Unit: pieces Description: Fresh mushroom Expiration: 08/10/2026 Pickup: UH Manoa |
| Steps | 1\. Navigate to Post Listing page 2\. Enter all required information 3\. Click Publish Listing |
| Expected result | The listing is created successfully and appears in the Browse Listings page. |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-027 |
| Related story | Edit Listing |
| Precondition | User is logged in and owns an existing listing. |
| Test data | Updated Description: "Fresh organic tomatoes" |
| Steps | 1\. Navigate to Dashboard 2\. Scroll to the My Active Listings section 3\. Click Edit 4\. Update the description 5\. Click Save Changes |
| Expected result | The listing is updated successfully, and the new description is displayed on the Listing Details page. |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-028 |
| Related story | Edit Listing |
| Precondition | User is logged in and owns an existing listing. |
| Test data | Listing ID: 1 |
| Steps | 1\. Click Delete Listing 2\. Navigate to Browse Listings 3\. Search for the deleted listing |
| Expected result | The deleted listing no longer appears in the public listings. |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-029 |
| Related story | Edit Listing |
| Precondition | User is logged in but does not own the listing |
| Test data | Listing ID: 1 |
| Steps | 1\. Open another user's listing. 2\. Attempt to edit the listing. |
| Expected result | The user is denied permission to edit the listing. |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-030 |
| Related story | Edit Listing |
| Precondition | User is logged in and editing a listing |
| Test data | Listing ID: 1 |
| Steps | 1\. Make changes to the listing 2\. Click Cancel instead of Save Changes |
| Expected result | The changes are discarded, and the original listing information remains unchanged. |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-031 |
| Related story | Edit Listing |
| Precondition | User is logged in and editing a listing |
| Test data | Listing ID: 1 Current Status: Available New Status: Reserved |
| Steps | 1\. Change status from Available to Reserved 2\. Click Save Changes |
| Expected result | Status update is saved successfully. Listing status displays as Reserved. |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-032 |
| Related story | Edit Listing |
| Precondition | User is logged in and editing a listing |
| Test data | Listing ID: 1 Current Status: Available New Status: Closed |
| Steps | 1\. Change status from Available to Closed 2\. Click Save Changes |
| Expected result | Status update is saved successfully. Listing status displays as Closed and does not show on the Browse Listing page. Listing is no longer available for new requests. |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-033 |
| Related story | Track Listing Quantity |
| Precondition | User owns an existing food listing, and a requester has submitted a request |
| Test data | Listing ID: 1 Initial Quantity: 5 green beans Requested Quantity: 3 green beans |
| Steps | 1\. Log in as the listing owner 2\. Navigate to Messages 3\. Approve the request for 3 green benas 4\. View listing details |
| Expected result | Request status changes to Accepted, and listing quantity decreases from 5 to 3 green beans. |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-034 |
| Related story | Track Listing Quantity |
| Precondition | User owns an existing food listing, and a requester has submitted a request |
| Test data | Listing ID: 1 Initial Quantity: 5 green beans Requested Quantity: 3 green beans |
| Steps | 1\. Log in as the listing owner 2\. Navigate to Messages 3\. Decline the request |
| Expected result | Request status changes to Denied, and listing quantity remains unchanged |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-035 |
| Related story | Track Listing Quantity |
| Precondition | User owns an existing food listing, and a requester has submitted a request |
| Test data | Listing ID: 1 Initial Quantity: 5 green beans Requested Quantity: 5 green beans |
| Steps | 1\. Log in as the listing owner 2\. Navigate to Messages 3\. Approve the request 4\. View Listings |
| Expected result | Request status changes to Accepted, and Listing status changes to Reserved. |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-036 |
| Related story | Messages |
| Precondition | User is logged in and is on the Messages page |
| Test data | Message ID: 1 |
| Steps | 1\. Enter a message 2\. Send a message |
| Expected result | Message is sent to listing owner, and conversation is linked to the listing |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-037 |
| Related story | Messages |
| Precondition | User is logged in and receives incoming messages |
| Test data | Message ID: 1 |
| Steps | 1\. Navigate to Messages  |
| Expected result | Owner sees new conversation, and message content is displayed with listing information attached |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-038 |
| Related story | Messages |
| Precondition | User is logged in and is on the Messages page |
| Test data | Message ID: 1 |
| Steps | 1\. Navigate to Messages 2\. Open conversations |
| Expected result | Inbox displays: participant, listing title, timestamp, read/unread status |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-039 |
| Related story | Dashboard |
| Precondition | User is logged in and can view their personal dashboard |
| Test data | N/A |
| Steps | Navigate to Dashboard |
| Expected result | Dashboard displays: Recent Notifications My Communities My Active Listings Reserved & Pending Recent Messages |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-040 |
| Related story | Dashboard |
| Precondition | User is logged in and can view their personal dashboard |
| Test data | N/A |
| Steps | Navigate to Dashboard |
| Expected result | Dashboard displays: Recent Notifications My Communities My Active Listings Reserved & Pending Recent Messages |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-041 |
| Related story | Dashboard |
| Precondition | User is logged in and can view their personal dashboard |
| Test data | N/A |
| Steps | 1\. Navigate to Dashboard 2\. Click Create Listing |
| Expected result | User is redirect to the Create Listing page. |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-042 |
| Related story | Dashboard |
| Precondition | User is logged in and can view their personal dashboard |
| Test data | N/A |
| Steps | 1\. Navigate to Dashboard 2\. Click Browse Listings |
| Expected result | User is redirect to the Browse Listings page. |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-043 |
| Related story | Dashboard |
| Precondition | User is logged in and can view their personal dashboard |
| Test data | N/A |
| Steps | 1\. Navigate to Dashboard 2\. Click Messages |
| Expected result | User is redirect to the Messages page. |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-044 |
| Related story | Dashboard |
| Precondition | User is logged in and can view their personal dashboard |
| Test data | N/A |
| Steps | 1\. Navigate to Dashboard 2\. Click Communities |
| Expected result | User is redirect to the Communities page. |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-045 |
| Related story | Dashboard |
| Precondition | User is logged in and can view their personal dashboard |
| Test data | N/A |
| Steps | 1\. Navigate to Dashboard 2\. Click View All next to Recent Notifications |
| Expected result | User is redirect to the Notifications page. |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-046 |
| Related story | Dashboard |
| Precondition | User is logged in and can view their personal dashboard |
| Test data | N/A |
| Steps | 1\. Navigate to Dashboard 2\. Click View All next to Recent Notifications |
| Expected result | User is redirect to the Notifications page. |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-047 |
| Related story | Dashboard |
| Precondition | User is logged in and can view their personal dashboard |
| Test data | N/A |
| Steps | 1\. Navigate to Dashboard 2\. Click View All next to Recent Notifications |
| Expected result | User is redirect to the Notifications page. |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-048 |
| Related story | Dashboard |
| Precondition | User is logged in and can view their personal dashboard |
| Test data | N/A |
| Steps | 1\. Navigate to Dashboard 2\. Click Browse All next to My Communities |
| Expected result | User is redirect to the Communities page. |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-049 |
| Related story | Dashboard |
| Precondition | User is logged in and can view their personal dashboard |
| Test data | N/A |
| Steps | 1\. Navigate to Dashboard 2\. Click Browse All History next to My Active Listings |
| Expected result | User is redirect to the History page. |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-050 |
| Related story | Dashboard |
| Precondition | User is logged in and can view their personal dashboard |
| Test data | N/A |
| Steps | 1\. Navigate to Dashboard 2\. Click Browse All next to My Active Listings |
| Expected result | User is redirect to the History page. |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-051 |
| Related story | Dashboard |
| Precondition | User is logged in and can view their personal dashboard |
| Test data | N/A |
| Steps | 1\. Navigate to Dashboard 2\. Click View All next to Recent Messages |
| Expected result | User is redirect to the Messages page. |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-052 |
| Related story | Manage Profile |
| Precondition | User is logged in |
| Test data | N/A |
| Steps | Navigate to Profile page |
| Expected result | User can view Reviews |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-053 |
| Related story | Manage Profile |
| Precondition | User is logged in |
| Test data | N/A |
| Steps | 1\. Navigate to Profile page 2\. Click on the Settings 3\. Update information and click Save Changes |
| Expected result | User can update: Display Name Email Location Bio Photo |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-054 |
| Related story | Manage Profile |
| Precondition | User is logged in |
| Test data | N/A |
| Steps | 1\. Navigate to Profile page 2\. Click on the View Listing History |
| Expected result | History displays: Produce item Date Quantity Status |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-055 |
| Related story | View Listing History |
| Precondition | User is logged in and owns listings |
| Test data | N/A |
| Steps | 1\. Navigate to Profile page 2\. Click on the View Listing History 3\. Click filters |
| Expected result | Listing history is filtered according to the user's filter selections. |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-056 |
| Related story | View Listing History |
| Precondition | User is logged in and claimed listings before |
| Test data | N/A |
| Steps | 1\. Navigate to Profile page 2\. Click on the View Listing History 3\. Click Leave Review button 4\. Select a rating and add comment 5\. Click Submit Review |
| Expected result | Review is submitted and listing owner receives this review. |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-057 |
| Related story | Communities |
| Precondition | User is logged in and communities exist in the system |
| Test data | N/A |
| Steps | 1\. Navigate to Communities page 2\. Browse available communities |
| Expected result | Public community list load successfully. Each community card displays: Community name Description Member |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-058 |
| Related story | Communities |
| Precondition | User is logged in and communities exist in the system |
| Test data | Community 1: Manoa Valley Garden Share Community 2: UH Manoa Food Exchange |
| Steps | 1\. Navigate to Communities page 2\. Browse available communities 3\. Search by keyword Manoa |
| Expected result | Both Community 1 and 2 display |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-059 |
| Related story | Communities |
| Precondition | User is logged in and communities exist in the system |
| Test data | Community: Kaimuki Community Kitchen |
| Steps | 1\. Navigate to Communities page 2\. Browse available communities 3\. Click Join Community |
| Expected result | User becomes a community member, and member count increases by one |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-060 |
| Related story | Communities |
| Precondition | User is logged in and communities exist in the system |
| Test data | Community: Kaimuki Community Kitchen |
| Steps | 1\. Navigate to Communities page 2\. Browse available communities 3\. Click View Community |
| Expected result | User can view listings for that community |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-061 |
| Related story | Manage Communities |
| Precondition | User is logged in and communities exist in the system |
| Test data | Community: Kaimuki Community Kitchen |
| Steps | 1\. Navigate to Communities page 2\. Browse available communities 3\. Click View Community 4\. Click Posts tab |
| Expected result | User can view other members’ posts |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-062 |
| Related story | Manage Communities |
| Precondition | User is logged in and communities exist in the system |
| Test data | Community: Kaimuki Community Kitchen |
| Steps | 1\. Navigate to Communities page 2\. Browse available communities 3\. Click View Community 4\. Click Posts tab 5\. Fill out a textbox 6\. Click Post  |
| Expected result | User can share a post to the community |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-063 |
| Related story | Manage Communities |
| Precondition | User is logged in and communities exist in the system |
| Test data | Community: Kaimuki Community Kitchen |
| Steps | 1\. Navigate to Communities page 2\. Browse available communities 3\. Click View Community 4\. Click Members tab |
| Expected result | User can view members of the community and their roles |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-064 |
| Related story | Manage Communities |
| Precondition | User is logged in and is an admin of the community |
| Test data | Community: Kaimuki Community Kitchen |
| Steps | 1\. Navigate to Communities page 2\. Browse available communities 3\. Click View Community 4\. Click Manage Community 5\. On the Members tab, change a member’s role to Admin |
| Expected result | User can change other member’s role from member to admin |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-065 |
| Related story | Manage Communities |
| Precondition | User is logged in and is an admin of the community |
| Test data | Community: Kaimuki Community Kitchen |
| Steps | 1\. Navigate to Communities page 2\. Browse available communities 3\. Click View Community 4\. Click Manage Community 5\. On the Members tab, remove a user by clicking Remove 6\. Confirm by clicking Remove Member |
| Expected result | User gets removed from the community |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-066 |
| Related story | Manage Communities |
| Precondition | User is logged in and is an admin of the community |
| Test data | Community: Kaimuki Community Kitchen |
| Steps | 1\. Navigate to Communities page 2\. Browse available communities 3\. Click View Community 4\. Click Manage Community 5\. Click Invitations tab 6\. Enter an email address 7\. Click Send invite |
| Expected result | User receives an invitation link via email |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-067 |
| Related story | Manage Communities |
| Precondition | User is logged in and is an admin of the community |
| Test data | Community: Kaimuki Community Kitchen |
| Steps | 1\. Navigate to Communities page 2\. Browse available communities 3\. Click View Community 4\. Click Manage Community 5\. Click Settings tab  |
| Expected result |  |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-068 |
| Related story | Notifications |
| Precondition | User is logged in and has notifications |
| Test data | N/A |
| Steps | 1\. Navigate to Notifications page |
| Expected result | Notifications are displayed successfully |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-069 |
| Related story | Notifications |
| Precondition | User is logged in |
| Test data | N/A |
| Steps | 1\. User B sends a message from a listing conversation 2\. Log in as User A 3\. Open Notifications |
| Expected result | A new message notification appears, and notification identifies the sender and related listing |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-070 |
| Related story | Notifications |
| Precondition | User is logged in and is an admin of a community |
| Test data | N/A |
| Steps | 1\. Sends an invitation link to User A 2\. User A joins the private community via link |
| Expected result | A new message notification appears, and notification includes community name |
| Actual result |  |
| Pass/fail |  |

| Field | Example |
| ----- | ----- |
| Test case ID | TC-071 |
| Related story | Notifications |
| Precondition | User is logged in and has an active listing |
| Test data | Listing expiring soon |
| Steps | Navigate to Notifications page |
| Expected result | A new message notification appears, and notification shows that user’s listing is expiring soon |
| Actual result |  |
| Pass/fail |  |

