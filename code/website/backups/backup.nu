git pull

# let root_url = echo "https://eager-bee-06aqohg53hq27c0jg11k14gdbk.aws-use1.surreal.cloud/"
let root_url = echo "https://creative-swallo-06egut78q5ostc88hn8182m37o.aws-usw2.surreal.cloud/"

let resp = (curl -X POST $"($root_url)/signin"
	-H "Accept: application/json"
	-H "Content-Type: application/json"
	-d '{
		"ns": "comp1100",
		"db": "master",
		"user": "viewer",
		"pass": "e670af83-7e30-422d-8b9f-7e8c22803e3b"
	}'
) | from json
print $"Reponse: ($resp)"
let token = $resp.token;


def backup_table [name: string] {
	(curl -X GET $"($root_url)/key/($name)"
 -H "Accept: application/json"
 -H $"Authorization: Bearer ($token)"
 | save -f $"($name).json")
}

backup_table "program_requirement"
backup_table "course"
backup_table "program"

# git commit -am `chore(backup)`
# git push
