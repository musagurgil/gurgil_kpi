import { TicketManagement } from "@/components/tickets/TicketManagement";

export default function Tickets() {
  return (
    <div className="flex-1 bg-dashboard-bg min-h-screen p-4 sm:p-6">
      <TicketManagement />
    </div>
  );
}
