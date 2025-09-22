# MVP prototype features:
- Saves all your information based on your student number so you can access it from any device easily
- Records your program, major and minor (you must pick your major and minor)
- Tracks what classes you have already finished (marked as green with tick)
- Tracks what classes you are doing currently (marked as yellow)
- Allows you to experiment with multiple plans for future courses, including which semester each class is done (marked as blue)
- Gives an overview of all courses in your major
- All courses are organised by the earliest semester you can do it, while completing pre-requisites

## MVP Spec (Figma):
- Step 1: Collects student number (to save)
- Step 2: You enter your program / degree
- Step 3: You enter your major (have to pick one, can change later)
- Step 4: You enter your minor (have to pick one, can change later)
- Home screen: Shows five columns
	- First is done courses in green (and failed courses in red below)
	- Second is doing courses in yellow
	- Third is next semester courses planned, with a green pin on planned courses
	- Fourth is two semesters ahead, with a green pin on planned courses
	- Fifth column is for whatever course is selected, empty by default
	- For all courses show a friend icon for classes your friend is doing
	- Fifth column is empty if nothing is selected. If a course is selected:
		- Shows at top the course code
		- Then course name underneath
		- Then pre-requisites listed underneath
		- Then the link to SI-Net
		- List friends doing the same course
		- Then a (scrollable) list of comments making the available space,
		- And on the bottom a bar to post your own comment