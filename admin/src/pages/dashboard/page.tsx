import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"

import React, {useEffect} from "react"
import dashboardSore from "@/store/dashboardSore";

export default function Page() {
  useEffect(() => {
    dashboardSore.fetchPaymentStats()
    dashboardSore.fetchUserStats()
    dashboardSore.fetchVisitStats()
    dashboardSore.fetchMembershipStats()
  }, [])

  return (
    <div className={"bg-dark-06 min-h-screen"}>
      <div className="flex flex-1 flex-col bg-dark-06 container">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 md:gap-6 ">
            <SectionCards />
            <div className="">
              <ChartAreaInteractive />
            </div>
            {/*<DataTable data={data} />*/}
          </div>
        </div>
      </div>
    </div>

  )
}
