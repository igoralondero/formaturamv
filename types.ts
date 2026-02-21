
export interface Companion {
  name: string;
  type: 'Adulto' | 'Criança';
}

export interface RSVPData {
  fullName: string;
  email?: string;
  phone?: string;
  contactMethod: 'email' | 'phone';
  attending: boolean;
  adultsCount: number;
  childrenCount: number;
  companions: Companion[];
}

export type AccessStatus = 'pending' | 'denied' | 'granted';
