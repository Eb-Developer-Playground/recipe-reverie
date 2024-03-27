export interface User {
  id: string;

  name: string;
  email: string;
  countryCode?: string;
  phoneNumber?: string;

  city?: string;
  country?: string;

  aboutMe?: string;

  profilePicture?: string;
  profileCoverImage?: string;
  updateFlag?: boolean;
}
