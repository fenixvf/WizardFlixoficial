import { SiInstagram, SiYoutube, SiX, SiTiktok, SiFacebook, SiDiscord, SiTwitch } from "react-icons/si";
import { Globe } from "lucide-react";

export interface SocialMediaInfo {
  name: string;
  icon: any;
  color: string;
}

export function detectSocialMedia(url: string): SocialMediaInfo {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('instagram.com') || lowerUrl.includes('instagram')) {
    return { name: 'Instagram', icon: SiInstagram, color: '#E4405F' };
  }
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    return { name: 'YouTube', icon: SiYoutube, color: '#FF0000' };
  }
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
    return { name: 'Twitter/X', icon: SiX, color: '#000000' };
  }
  if (lowerUrl.includes('tiktok.com')) {
    return { name: 'TikTok', icon: SiTiktok, color: '#000000' };
  }
  if (lowerUrl.includes('facebook.com')) {
    return { name: 'Facebook', icon: SiFacebook, color: '#1877F2' };
  }
  if (lowerUrl.includes('discord.com') || lowerUrl.includes('discord.gg')) {
    return { name: 'Discord', icon: SiDiscord, color: '#5865F2' };
  }
  if (lowerUrl.includes('twitch.tv')) {
    return { name: 'Twitch', icon: SiTwitch, color: '#9146FF' };
  }
  
  return { name: 'Website', icon: Globe, color: '#8B5CF6' };
}
