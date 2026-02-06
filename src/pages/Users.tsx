import { UserManagement } from "@/components/users/UserManagement";

export default function Users() {
  return (
    <div className="flex-1 bg-dashboard-bg min-h-screen p-6">
      <UserManagement />
    </div>
  );
}
