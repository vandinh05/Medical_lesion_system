export default function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="search-input">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke="#8CA0BF" strokeWidth="1.6" />
        <path d="M21 21l-4.3-4.3" stroke="#8CA0BF" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
