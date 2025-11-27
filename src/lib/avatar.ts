/**
 * Generate a random avatar URL using DiceBear API
 * @param seed - A unique string to generate the avatar (e.g., email or name)
 * @returns Avatar URL
 */
export function generateAvatar(seed: string): string {
    // Use DiceBear's avataaars style for friendly, Notion-style avatars
    const cleanSeed = encodeURIComponent(seed.toLowerCase().trim());
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanSeed}`;
}

/**
 * Alternative avatar styles available:
 * - adventurer
 * - avataaars
 * - bottts
 * - fun-emoji
 * - initials
 * - lorelei
 * - micah
 * - personas
 */
export function generateAvatarWithStyle(seed: string, style: string = "avataaars"): string {
    const cleanSeed = encodeURIComponent(seed.toLowerCase().trim());
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${cleanSeed}`;
}
