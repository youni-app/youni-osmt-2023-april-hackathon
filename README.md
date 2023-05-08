# Youni OSMT 2023 April Hackathon Submission

Hello! This repo will summarize Youni's "Integrations" catgeory submission for the OSMT 2023 April Hackathon. The video for this submission can be found <a href="https://youtu.be/p5JYQNKJoZg">here</a>.

>

## What is Youni? - Review

Youni is a community-driven virtual trade school that focuses on hosting courses that are application-based and project-based. If a teacher has an online course, they can come to Youni, sign up, and post their course. The catch is that in order for their course to show up in the marketplace, it must be what we call "endorsed" by two companies who are in the industry that the course is relevant to. Endorsement essentially means that the company has looked at the course, reviewed the curriculum, and added their stamp of approval to it.

## Submission Description - Integrating RSDs

For its Hackathon submission, Youni has added a <b>_new_</b> feature that allows teachers to attach "Skill Tags" to their courses. Skill tags are basically RSDs. This way, teachers can specify the skills that students can expect to learn by taking their course.

Try it out now!

<a href="https://youniapp.xyz">youniapp.xyz</a>

## How did we do it?

We have decided to include code snippets from the Youni web app that will allow anyone to integrate this feature into their own application.

### Database Setup

The first step is to create a database and upload RSDs to it. We used prisma and MongoDB with the following schema:

```prisma
model SkillTag {
  id String @id @default(auto()) @map("_id") @db.ObjectId
  url String
  name String
  author String
  skillStatement String
  category String
  keywords String[]
  alignmentName String

  courses Course[] @relation(fields: [coursesIds], references: [id])
  coursesIds String[] @db.ObjectId
}
```

In our case, a `SkillTag` is linked to a `Course`, but you can link them to whatever you want.

You can download the RSDs you want in your application by going to the <a href="https://www.wgu.edu/lp/general/wgu/skills-library.html">Western Governors University Skills Library Collections</a>.

The script used to upload the RSDs to the database can be seen in `upload.py`:

```python
import asyncio
from prisma import Prisma
import csv
import json


async def main() -> None:
    try:
        db = Prisma()
        await db.connect()

        filename="RSD Skills.csv"

        listi= []
        with open(filename,'r') as data:
           for line in csv.DictReader(data):

              line["Keywords"] = line["Keywords"].split(";")[:-1]
              dicti = {"url": line["Canonical URL"], "name": line["RSD Name"], "author": line["Author"], "skillStatement": line["Skill Statement"], "category": line["Category"], "keywords": line['Keywords'], "alignmentName": line["Alignment Name"]}
              listi.append(dicti)
        for item in listi:
            print(item)
            await db.skill.create(item)

        await db.disconnect()
    except Exception as e: print(e)

if __name__ == '__main__':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
```

Once your RSDs are uploaded to your database, you can begin to use them in your app!

### Frontend Component

Youni is built using the Remix framework so we will include the React component that allows you to search the RSDs uploaded to your database. The component can be found in `skillSearch.tsx`

First, we will go over the component itself. The `SkillSearch` component is built using <a href="https://tailwindcss.com/">TailwindCSS</a> and <a href="https://heroicons.com/">Heroicons</a>.

```jsx
export default function SkillSearch() {
  const [skills, setSkills] = useState<{ id: string; name: string }[]>([]);
  const queryResults = useActionData<typeof action>();
  const submit = useSubmit();

  const onChangeSkillSearch = async (event: any) => {
    event.preventDefault();
    const skillQuery = String(event.target.value);
    const formData = new FormData();
    formData.set("action", "searchSkills");
    formData.set("skillQuery", skillQuery);
    submit(formData, { method: "POST" });
  };

  const skillSelected = (skillId: string) => {
    for (let skill of skills) {
      if (skill.id === skillId) {
        return true;
      }
    }
    return false;
  };

  const onClickSkill = (skill: Skill) => {
    if (skillSelected(skill.id)) {
      setSkills(skills.filter((s) => s.id !== skill.id));
    } else {
      setSkills([{ id: skill.id, name: skill.name }, ...skills]);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <label>Skill Tags</label>
      <input
        type="text"
        name="skillSearch"
        onChange={onChangeSkillSearch}
        className="w-64"
      />
      <div className="flex flex-wrap gap-3">
        {skills.map((skill: { id: string, name: string }) => (
          <div className="rounded-full text-black py-2 px-4 bg-gray-300">
            {skill.name}
          </div>
        ))}
      </div>
      {queryResults ? (
        queryResults.map((skill: Skill) => (
          <button
            onClick={(event: any) => {
              event.preventDefault();
              onClickSkill(skill);
            }}
            className="flex items-center justify-between rounded-lg border border-blue text-blue p-4 text-left"
          >
            <div className="flex flex-col text-md gap-2">
              <p className="font-semibold">{skill.name}</p>
              <p>{skill.skillStatement}</p>
            </div>
            {skillSelected(skill.id) ? (
              <CheckCircleIcon className="w-8 h-8" />
            ) : (
              <div className="rounded-full border border-blue w-6 h-6" />
            )}
          </button>
        ))
      ) : (
        <></>
      )}
    </div>
  );
}
```

Skill tags are loaded by submitting to the action function of the current route. Whenever the query in the text input is changed, it is submitted to the action function of the component. The action function returns `queryResults` through the `useActionData` hook provided by Remix. The action function of the route can be seen here:

```jsx
export const action: ActionFunction = async (args: ActionArgs) => {
  let formData = await args.request.formData();
  const action = formData.get("action");

  if (action === "searchSkills") {
    const query = String(formData.get("skillQuery"));
    const queryResults = await searchSkills(query);
    return queryResults;
  } else {
    /* other actions */
  }
};
```

The `searchSkills` function must be stored in a `.server.ts` file so that it runs on the server:

```jsx
export async function searchSkills(query: string) {
  return await prisma.skillTag.findMany({
    where: {
      name: {
        contains: query,
        mode: "insensitive",
      },
    },
    take: 5, // Number of results desired
  });
}
```

The skill tags that the user selects will be stored in the `skills` state variable. Use it to link the skill tags to other data however you please!
