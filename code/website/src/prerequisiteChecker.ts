export let errors: { [id: string]: string } = {};

export function preresuisiteCheck(term: string, course_plan: any, selected_course: string) {
    const id = term.split(" ");
    console.log(programs);
    for (const course in course_plan) {
        const course_split = course.split(" ");
        if ((parseInt(id[0]) < parseInt(course_split[0])) || 
        (id[0] === course_split[0] && parseInt(id[1]) < parseInt(course_split[1]))) {

        }
    }
}