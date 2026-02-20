import { UserManagement } from "@/components/users/UserManagement";
import { Users as UsersIcon, UserPlus, Building2 } from "lucide-react";

export default function Users() {
  return (
    <div className="flex-1 bg-dashboard-bg min-h-screen">
      {/* Premium Gradient Header */}
      <div className="relative overflow-hidden bg-gradient-brand px-6 py-10 mb-8 sm:rounded-b-3xl sm:mx-4 lg:mx-6 sm:mt-0 shadow-lg">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:16px_16px]" />
        <div className="absolute -left-20 -top-20 w-60 h-60 bg-white/10 rounded-full blur-3xl opacity-50 animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-purple-400/20 rounded-full blur-3xl opacity-50 animate-pulse" style={{ animationDuration: '6s' }} />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Kullanıcılar
                </h1>
                <p className="text-white/70 text-sm">
                  Personel ve departman yönetimi
                </p>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
              <UserPlus className="w-4 h-4 text-emerald-300" />
              <span className="text-white/90 text-sm font-medium">Yeni Kullanıcı Ekle</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
              <Building2 className="w-4 h-4 text-blue-300" />
              <span className="text-white/90 text-sm font-medium">Departman Yönet</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 pb-8">
        <UserManagement />
      </div>
    </div>
  );
}
