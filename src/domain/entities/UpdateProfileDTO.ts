/**
 * Update Profile DTO - Data Transfer Object
 */
export interface UpdateProfileDTO {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  profile_image?: {
    uri: string;
    type: string;
    name: string;
  };
}
