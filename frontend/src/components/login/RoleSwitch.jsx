// Reusable segmented control for picking a role.
// Add more roles here later (e.g. "nurse") without touching LoginForm.
const ROLES = [
  {
    value: "doctor",
    label: "Bác sĩ",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 12a4 4 0 100-8 4 4 0 000 8z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M4 21c0-4 3.6-6 8-6s8 2 8 6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    value: "admin",
    label: "Quản trị viên",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2l7 3v6c0 5-3.2 8.5-7 10-3.8-1.5-7-5-7-10V5l7-3z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function RoleSwitch({ value, onChange }) {
  return (
    <div className="segmented">
      {ROLES.map((role) => (
        <button
          key={role.value}
          type="button"
          className={value === role.value ? "active" : ""}
          onClick={() => onChange(role.value)}
        >
          {role.icon}
          {role.label}
        </button>
      ))}
    </div>
  );
}
