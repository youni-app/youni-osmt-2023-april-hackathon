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
