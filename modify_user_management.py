import re

with open('src/components/users/UserManagement.tsx', 'r') as f:
    content = f.read()

# Replace the useEffect and useState for filteredUsers with useMemo

# Step 1: Add useMemo to imports
content = re.sub(r'import \{ useState, useEffect \} from "react";', 'import { useState, useMemo } from "react";', content)

# Step 2: Remove the useState for filteredUsers
content = re.sub(r'  const \[filteredUsers, setFilteredUsers\] = useState<User\[\]>\(\[\]\);\n', '', content)

# Step 3: Replace the useEffect with two useMemos
old_effect = r"""  // Process and filter users
  useEffect\(\(\) => \{
    if \(\!profiles\) return;

    let processed = profiles\.map\(profile => \{
      const activeTicketsCount = tickets\.filter\(t =>
        t\.assignedTo === profile\.id &&
        t\.status \!\=\= 'resolved' &&
        t\.status \!\=\= 'closed'
      \)\.length;

      const userKPIs = kpiStats\.filter\(k => k\.assignedUsers\?\.includes\(profile\.id\)\);
      const totalKPIs = userKPIs\.length;
      const completedKPIs = userKPIs\.filter\(k => k\.status === 'success' \|\| k\.progressPercentage >= 100\)\.length;
      const kpiPercentage = totalKPIs > 0 \? \(completedKPIs / totalKPIs\) \* 100 : 0;

      return \{
        \.\.\.profile,
        role: \(profile\.userRoles\?\.\[0\]\?\.role \|\| 'employee'\) as 'admin' \| 'department_manager' \| 'employee',
        isActive: profile\.isActive \?\? true,
        activeTickets: activeTicketsCount,
        kpiStats: \{
          total: totalKPIs,
          completed: completedKPIs,
          percentage: kpiPercentage
        \}
      \};
    \}\);

    // Apply filters
    if \(searchTerm\) \{
      processed = processed\.filter\(user =>
        user\.firstName\.toLowerCase\(\)\.includes\(searchTerm\.toLowerCase\(\)\) \|\|
        user\.lastName\.toLowerCase\(\)\.includes\(searchTerm\.toLowerCase\(\)\) \|\|
        user\.email\.toLowerCase\(\)\.includes\(searchTerm\.toLowerCase\(\)\)
      \);
    \}

    if \(selectedDepartment \!\=\= 'all'\) \{
      processed = processed\.filter\(user => user\.department === selectedDepartment\);
    \}

    if \(selectedRole \!\=\= 'all'\) \{
      processed = processed\.filter\(user => user\.role === selectedRole\);
    \}

    if \(showInactive\) \{
      processed = processed\.filter\(user => \!user\.isActive\);
    \} else \{
      processed = processed\.filter\(user => user\.isActive\);
    \}

    setFilteredUsers\(processed as User\[\]\);
  \}, \[profiles, tickets, kpiStats, searchTerm, selectedDepartment, selectedRole, showInactive\]\);"""

new_effect = """  // ⚡ Bolt Optimization: Memoize and pre-compute user statistics
  // What: Replaced O(N*M) nested filtering inside useEffect with pre-computed O(N) hash maps and useMemo
  // Why: Prevents recalculating active tickets and KPIs for all users on every re-render (e.g. search keystroke)
  const processedUsers = useMemo(() => {
    if (!profiles) return [];

    // Pre-calculate active tickets per user in O(T) time
    const activeTicketsMap = tickets.reduce((acc, t) => {
      if (t.assignedTo && t.status !== 'resolved' && t.status !== 'closed') {
        acc[t.assignedTo] = (acc[t.assignedTo] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Pre-calculate KPIs per user in O(K * U) time where U is usually small
    const userKPIMap = kpiStats.reduce((acc, k) => {
      const isCompleted = k.status === 'success' || k.progressPercentage >= 100;
      k.assignedUsers?.forEach(userId => {
        if (!acc[userId]) acc[userId] = { total: 0, completed: 0 };
        acc[userId].total += 1;
        if (isCompleted) acc[userId].completed += 1;
      });
      return acc;
    }, {} as Record<string, { total: number, completed: number }>);

    return profiles.map(profile => {
      const activeTicketsCount = activeTicketsMap[profile.id] || 0;

      const kpiData = userKPIMap[profile.id] || { total: 0, completed: 0 };
      const totalKPIs = kpiData.total;
      const completedKPIs = kpiData.completed;
      const kpiPercentage = totalKPIs > 0 ? (completedKPIs / totalKPIs) * 100 : 0;

      return {
        ...profile,
        role: (profile.userRoles?.[0]?.role || 'employee') as 'admin' | 'department_manager' | 'employee',
        isActive: profile.isActive ?? true,
        activeTickets: activeTicketsCount,
        kpiStats: {
          total: totalKPIs,
          completed: completedKPIs,
          percentage: kpiPercentage
        }
      } as User;
    });
  }, [profiles, tickets, kpiStats]);

  // Apply filters on top of processed users
  const filteredUsers = useMemo(() => {
    let result = processedUsers;

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(user =>
        user.firstName.toLowerCase().includes(lowerSearch) ||
        user.lastName.toLowerCase().includes(lowerSearch) ||
        user.email.toLowerCase().includes(lowerSearch)
      );
    }

    if (selectedDepartment !== 'all') {
      result = result.filter(user => user.department === selectedDepartment);
    }

    if (selectedRole !== 'all') {
      result = result.filter(user => user.role === selectedRole);
    }

    if (showInactive) {
      result = result.filter(user => !user.isActive);
    } else {
      result = result.filter(user => user.isActive);
    }

    return result;
  }, [processedUsers, searchTerm, selectedDepartment, selectedRole, showInactive]);"""

content = re.sub(old_effect, new_effect, content)

with open('src/components/users/UserManagement.tsx', 'w') as f:
    f.write(content)
