import useDashboardStore from '../store/useDashboardStore'
import OverviewTab from '../components/dashboard/OverviewTab'
import SprintsTab from '../components/dashboard/SprintsTab'
import TeamTab from '../components/dashboard/TeamTab'
import EpicsTab from '../components/dashboard/EpicsTab'
import RisksTab from '../components/dashboard/RisksTab'
import FlowTab from '../components/dashboard/FlowTab'
import OkrsTab from '../components/dashboard/OkrsTab'

const TAB_MAP = {
  overview: OverviewTab,
  sprints: SprintsTab,
  team: TeamTab,
  epics: EpicsTab,
  risks: RisksTab,
  flow: FlowTab,
  okrs: OkrsTab,
}

export default function DashboardPage() {
  const { dashboard, activeTab } = useDashboardStore()
  if (!dashboard) return null

  const TabComponent = TAB_MAP[activeTab] || OverviewTab

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-6">
      <TabComponent data={dashboard} />
    </div>
  )
}
