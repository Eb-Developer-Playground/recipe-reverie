export interface User {
  name: string;
  email: string;
  id: string;
  countryCode?: string;
  phoneNumber?: string;
  aboutMe?: string;
  profilePicture?: string;
  profileCoverImage?: string;
  updateFlag?: boolean;
}
