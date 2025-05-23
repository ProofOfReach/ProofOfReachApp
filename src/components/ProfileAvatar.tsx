import React, { useState, useEffect } from 'react';
import { fetchNostrProfile, createDefaultAvatar, npubToHex } from '../lib/nostrProfile';
import { User } from 'react-feather';

interface ProfileAvatarProps {
  pubkey: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showFallback?: boolean;
  className?: string;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ 
  pubkey, 
  size = 'md', 
  showFallback = true,
  className = ''
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!pubkey) {
      setIsLoading(false);
      setError(true);
      return;
    }

    const loadProfile = async () => {
      setIsLoading(true);
      setError(false);

      try {
        // Convert npub to hex if it's an npub format
        let pubkeyToUse = pubkey;
        if (pubkey.startsWith('npub1')) {
          const hexPubkey = npubToHex(pubkey);
          if (hexPubkey) {
            pubkeyToUse = hexPubkey;
          } else {
            console.log('Failed to convert npub to hex:', pubkey);
          }
        }

        const profile = await fetchNostrProfile(pubkeyToUse);
        if (profile && profile.picture) {
          setAvatarUrl(profile.picture);
        } else {
          // Use default avatar when no profile picture is available
          setAvatarUrl(createDefaultAvatar(pubkeyToUse));
        }
      } catch (e) {
        console.log('Error loading profile avatar:', e);
        setError(true);
        setAvatarUrl(createDefaultAvatar(pubkey));
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [pubkey]);

  // Size classes for the avatar
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
    xl: 'h-20 w-20'
  };

  // Fallback icon size
  const iconSize = {
    sm: 16,
    md: 20,
    lg: 28,
    xl: 40
  };

  // Showing loading state
  if (isLoading) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`}></div>
    );
  }

  // Show avatar image
  if (avatarUrl && !error) {
    return (
      <img 
        src={avatarUrl} 
        alt="Profile" 
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
        onError={() => {
          setError(true);
          setAvatarUrl(createDefaultAvatar(pubkey));
        }}
      />
    );
  }

  // Fallback for errors or no avatar
  if (showFallback) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center ${className}`}>
        <User size={iconSize[size]} className="text-purple-500 dark:text-purple-400" />
      </div>
    );
  }

  // Return null if no fallback should be shown
  return null;
};

export default ProfileAvatar;