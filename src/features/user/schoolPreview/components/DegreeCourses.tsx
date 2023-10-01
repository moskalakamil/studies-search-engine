import React from "react";
import { useT } from "@/utils/hooks/useTranslation";
import { School } from "@/models/school.model";
import { Badge } from "@/features/common/Badge";

interface IDegreeCoursesProps {
  isLoading: boolean;
  data?: School;
}

export default function DegreeCourses({
  isLoading,
  data,
}: IDegreeCoursesProps) {
  const { t } = useT();
  return (
    <div className="w-full">
      <h2 className="mb-5 text-2xl font-bold">{t("preview:coursesDegree")}</h2>
      {isLoading ? (
        <>
          <div
            className={"mb-4 h-14 w-full animate-pulse rounded-md bg-light"}
          />
          <div className={"h-14 w-2/3 animate-pulse rounded-md bg-light"} />
        </>
      ) : (
        <div className={"flex"}>
          {data!.degreeCourse.map((course) => (
            <div key={course.id} className={"flex"}>
              <Badge intent={"light"}>{course.name}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}