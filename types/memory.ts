export type Memory = {
  id: string;
  authorName: string;
  authorMeta: string;
  university: string;
  imageUri: string;
  avatarUri: string;
  quote: string;
  tags: string[];
  dateLabel?: string;
  likesCount?: string;
  title?: string;
  reflection?: string;
  hasVoice?: boolean;
  voiceLabel?: string;
  voiceDuration?: string;
};
