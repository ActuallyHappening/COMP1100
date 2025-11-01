git pull

let root_url = echo "https://eager-bee-06aqohg53hq27c0jg11k14gdbk.aws-use1.surreal.cloud/"

def backup_table [name: string] {
	(curl -X GET $"($root_url)/key/($name)"
 -H "Accept: application/json"
 -H "Surreal-NS: comp1100"
 -H "Surreal-DB: master" | save -f $"($name).json")
}

backup_table "program_requirement"
backup_table "course"
backup_table "program"

git commit -am `chore(backup)`
git push
