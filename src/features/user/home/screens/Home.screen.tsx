import React, { useEffect, useMemo, useState } from "react";
import SearchInputs from "@/features/user/home/components/SearchInputs";
import { useT } from "@/utils/hooks/useTranslation";
import { z } from "zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import Filters from "../components/FiltersContainer";
import SchoolList from "../components/SchoolList";
import FiltersContainer from "../components/FiltersContainer";
import { IGetSchoolsReq, School } from "@/models/school.model";
import { useQuery } from "@tanstack/react-query";
import { SchoolApi } from "@/api/requests/school.req";
import { queryKeys } from "@/api/queries/queryKeys";
import { useGetSchools } from "@/api/queries/school.query";

const Map = dynamic(() => import("@/features/user/home/components/Map"), {
  ssr: false,
});

function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState(0);

  function handleScroll() {
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;

    const windowScroll = document.documentElement.scrollTop;

    const scrolled = (windowScroll / height) * 100;

    setScrollPosition(scrolled);
  }

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  return scrollPosition;
}

const HomeScreen = () => {
  const { t } = useT();

  const [filterData, setFilterData] = useState<Omit<IGetSchoolsReq, "page">>({
    query: "",
    types: undefined,
    minPrice: "",
    maxPrice: "",
    mode: 0,
    city: "",
  });
  const [page, setPage] = useState("0");
  const [actualData, setActualData] = useState<School[]>([]);
  const [shouldResetData, setShouldResetData] = useState(false);

  const { data, isLoading } = useGetSchools({
    page: page,
    city: filterData.city?.length === 0 ? undefined : filterData.city,
    maxPrice:
      filterData.maxPrice?.length === 0 ? undefined : filterData.maxPrice,
    minPrice:
      filterData.minPrice?.length === 0 ? undefined : filterData.minPrice,
    mode: filterData.mode,
    types: filterData.types,
    query: filterData.query?.length === 0 ? undefined : filterData.query,
  });

  const schema = z.object({
    search: z.object({
      query: z.string().optional(),
      radius: z.string().optional(),
      city: z
        .object({
          id: z.string(),
          name: z.string(),
          voivodeship: z.string(),
          x: z.string(),
          y: z.string(),
        })
        .optional()
        .nullable()
        .refine((val) => val !== null, t("chooseCityFromList")),
    }),
    filters: z.object({
      type: z.array(z.number()).optional(),
      mode: z.number().optional(),
      min: z.string().optional(),
      max: z.string().optional(),
      minPoints: z.string().optional(),
    }),
  });

  type InputsValues = z.infer<typeof schema>;

  const {
    register,
    control,
    trigger,
    formState: { errors },
    watch,
  } = useForm<InputsValues>({
    defaultValues: {
      search: {
        query: "",
        city: undefined,
        radius: "5",
      },
      filters: {
        max: "",
        min: "",
        minPoints: "",
        mode: 0,
        type: undefined,
      },
    },
    resolver: zodResolver(schema),
  });

  const search = useWatch({ control: control, name: "search" });
  const filters = useWatch({ control: control, name: "filters" });

  useEffect(() => {
    setShouldResetData(true);
    setFilterData({
      query: watch("search.query"),
      types: watch("filters.type") as any,
      mode: watch("filters.mode") as any,
      city: watch("search.city.name"),
      minPrice: watch("filters.min"),
      maxPrice: watch("filters.max"),
    });
  }, [search, filters]);

  useEffect(() => {
    if (data?.data) {
      setActualData((prevData) =>
        shouldResetData && data.data
          ? [...data.data]
          : data?.data
          ? [...prevData, ...data?.data]
          : [...prevData],
      );
    }
  }, [data, shouldResetData]);

  const scrollPosition = useScrollPosition();

  useEffect(() => {
    if (scrollPosition > 65) {
      setShouldResetData(false);
      setPage((prev) => (+prev + 1).toString());
    }
  }, [scrollPosition]);

  return (
    <div className="flex h-full flex-col">
      <Controller
        name={"search"}
        control={control}
        render={({ field: { onChange } }) => (
          <SearchInputs
            onChangeInputs={(val) => {
              onChange(val);
              if (!val.city) trigger("search.city");
            }}
            errors={errors?.search as any}
          />
        )}
      />

      <div className="z-0 mt-24 flex h-full flex-col-reverse px-2 xs:mt-16 sm:px-14 sm:pt-7 md:flex-row">
        <div className="h-full w-full md:w-[50%]">
          <Controller
            name={"filters"}
            control={control}
            render={({ field: { onChange } }) => (
              <FiltersContainer onChange={onChange} />
            )}
          />
          <SchoolList schools={actualData} isLoading={isLoading} />
        </div>
        <div className="right-0 mt-8 h-52 w-full pb-7 sm:mt-14 md:fixed md:ml-7 md:mt-0 md:h-[calc(100vh-11.75rem)] md:w-[calc(50%-1.75rem)] md:pr-14">
          <div className="h-full w-full overflow-hidden rounded-md">
            <Map />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
