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

[Figma presentation link](https://www.figma.com/proto/PnW2aTLoTMUzGnjrT3GJhi/COMP1100-Example-Prototype)

# MVP Test Cards
Hypothesis: Students would benefit from one place with many classes in the same place, with each course conveniently showing course information

Test: We will ask students if the above MVP shows course information in the same place well

Metric: If students believe they could see all necessary information for the courses

Criteria: If all students believed they could see all necessary information for their course plan, then this hypothesis will be achieved

Therefore, we will ask:
Does our solution show all the relevant information for courses?
Do you like the comments section being listed for each course next to its information?
Did you want any other links for each course?


Hypothesis: Students would benefit from a multi-user incorporation where they can interact with other students who have previously completed courses they are to take, as well as basing decisions off of what friends are doing, as implemented by us (in-house)

Test: We will show/explain a simple in-house solution and see their thoughts

Metric: If our in-house solution is liked and would be used by students

Criteria: If all students liked our in-house solution, we will consider this hypothesis achieved

Therefore, we will ask:
Would you feel it useful to comment on courses for future students in that manner?
Would you like a badge for users based on if they are a tutor or lecturer?
Do you want all people who give a review to be verified UQ students?

# MVP Learning Cards
Hypothesis: Students would benefit from one place with many classes in the same place, with each course conveniently showing course information

Observation: Students really liked how many courses were laid out all in one place. All students recommended colour coding. One student with insight recommended a badge system for courses contributing to your major or minor

Learning and insights: Students benefit from colour coding their classes

Therefore, we will accept this hypothesis as true

Evidence:
- Caleb Interview 4 & 5
- "Yeah, I think that would be very helpful. Being able to just have all that information there rather than search around for it, probably would help. Especially like people who don't really understand how to navigate, courses and uni stuff. It would really help them with finding information on stuff that's important to them." - [Liam Bienkowski Iteration 2 Interview 5](../../interviews/iteration_2/liam_bienkowski/liam_bienkowski_2025-09-23_5.md)
-[Himanshu] (../../interviews/iteration_2/himanshu/Himanshu_2025_9_24_.md)


Hypothesis: Students would benefit from a multi-user incorporation where they can interact with other students who have previously completed courses they are to take, as well as basing decisions off of what friends are doing, as implemented by us (in-house)

Observation: The simple leave a comment system was sufficient. Students wanted accountability (so that not anybody could comment on every course) but preferred anonymity. Comments should be identified to be from tutors or lecturers if possible

Learning and insights: The simple leave a comment system achieved all the goals students wanted

Therefore, we will accept this hypothesis as true

Evidence:
- Caleb Interview 4 & 5
- "Um, yeah, I think it would be. Commenting on courses could also give some coordinators some feedback. So they'd understand what the general consensus is around their courses are at the moment and then they can use that feedback to change certain things about courses." - [Liam Bienkowski Iteration 2 Interview 5](../../interviews/iteration_2/liam_bienkowski/liam_bienkowski_2025-09-23_5.md) 
