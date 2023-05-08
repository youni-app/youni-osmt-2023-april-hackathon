import { ActionArgs, ActionFunction } from "@remix-run/node";
import { useState } from "react";
import { useActionData, useSubmit } from "@remix-run/react";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { searchSkills } from "~/utils/skill.server";

type Skill = {
  id: string;
  url: string;
  name: string;
  author: string;
  skillStatement: string;
  category: string;
  keywords: string[];
  alignmentName: string;
  coursesIds: string[];
};

export const action: ActionFunction = async (args: ActionArgs) => {
  let formData = await args.request.formData();
  const action = formData.get("action");

  if (action === "searchSkills") {
    const query = String(formData.get("skillQuery"));
    const queryResults = await searchSkills(query);
    return queryResults;
  } else if (action === "create") {
    /* other actions */
  }
};

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
        {skills.map((skill: { id: string; name: string }) => (
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
