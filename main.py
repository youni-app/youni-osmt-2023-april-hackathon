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