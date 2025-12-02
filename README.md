# Peoplédex

Peoplédex is the ideal people indexer, mainly serving the autistic trait to remember and organize information about people they know. <!-- Also supports CardDAV, to perfectly integrate with your phone's contacts, for easy information access in your device's native contacts app.   -->
  
Helps keep track of (i.a.):

<!-- - Profile picture -->
- Name
- Full name
- Phone number
- Email
- Birthday
<!-- - Gender -->
<!-- - Physical characterastics (e.g. height) -->
<!-- - Characterastics history -->
<!-- - Languages they can speak -->
<!-- - Domains they own -->
<!-- - School / uni, which study (program, year) -->
<!-- - Job -->
- **SOON**: Arbitrary fields you add yourself
<!-- : booleans, strings, tables, numbers, locations, images   -->
<!-- generic text field for notes -->
<!-- generic notes list (just a list, not typed) -->
  
This tool is strictly meant for personal use! Requiring authentication and not supporting any sharing features.

## Demo

Youtube demo video: <https://youtu.be/UpVJc6Amal0>

A demo instance is available at <https://peopledex-demo.argv.nl/>  
Username: `demo`  
Password: `demopass`

## Installation (requires Deno)

```sh
git clone https://github.com/FurriousFox/Peopledex.git
cd Peopledex
deno run -A src/server.ts
```

Then open your browser at <http://localhost:5813>
