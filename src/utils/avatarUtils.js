/**
 * Utility functions for generating user avatars and initials
 */

/**
 * Generate initials from a full name
 * @param {string} fullName - The full name to generate initials from
 * @returns {string} - The initials (e.g., "John Smith" -> "JS")
 */
export const getInitials = (fullName) => {
  if (!fullName || typeof fullName !== 'string') return 'U';
  
  const names = fullName.trim().split(' ').filter(name => name.length > 0);
  
  if (names.length === 0) return 'U';
  if (names.length === 1) {
    // If only one name, use first two characters
    return names[0].substring(0, 2).toUpperCase();
  }
  
  // Use first letter of first name and first letter of last name
  const firstInitial = names[0].charAt(0).toUpperCase();
  const lastInitial = names[names.length - 1].charAt(0).toUpperCase();
  return firstInitial + lastInitial;
};

/**
 * Generate a consistent background color for an avatar based on the name
 * @param {string} name - The name to generate color from
 * @returns {string} - CSS classes for background and text color
 */
export const getAvatarColors = (name) => {
  if (!name) return 'bg-gray-100 text-gray-600';
  
  // Generate a hash from the name for consistent colors
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Define color combinations that work well
  const colorCombinations = [
    'bg-red-100 text-red-700',
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-yellow-100 text-yellow-700',
    'bg-purple-100 text-purple-700',
    'bg-pink-100 text-pink-700',
    'bg-indigo-100 text-indigo-700',
    'bg-orange-100 text-orange-700',
    'bg-teal-100 text-teal-700',
    'bg-cyan-100 text-cyan-700'
  ];
  
  const index = Math.abs(hash) % colorCombinations.length;
  return colorCombinations[index];
};

/**
 * Avatar component props generator
 * @param {string} name - The full name
 * @param {string} size - Size variant ('sm', 'md', 'lg', 'xl')
 * @returns {object} - Props for avatar component
 */
export const getAvatarProps = (name, size = 'md') => {
  const initials = getInitials(name);
  const colors = getAvatarColors(name);
  
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-sm',
    xl: 'h-12 w-12 text-lg'
  };
  
  return {
    initials,
    className: `${sizeClasses[size]} rounded-full ${colors} flex items-center justify-center font-medium`
  };
};

/**
 * React Avatar Component
 * @param {object} props - Component props
 * @param {string} props.name - The full name
 * @param {string} props.size - Size variant ('sm', 'md', 'lg', 'xl')
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} - Avatar component
 */
export const Avatar = ({ name, size = 'md', className = '' }) => {
  const { initials, className: avatarClassName } = getAvatarProps(name, size);
  
  return (
    <div className={`${avatarClassName} ${className}`}>
      <span>{initials}</span>
    </div>
  );
};

export default {
  getInitials,
  getAvatarColors,
  getAvatarProps,
  Avatar
};
