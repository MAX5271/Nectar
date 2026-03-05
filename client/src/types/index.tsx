// '|' this is pipe operator, hard coding the exact allowed strings. Empty string '' is included so as to include the default value without any user input.

export interface NectarPayload {
  email: string;
  username: string;
  password?: string;
  authProvider: 'local' | 'google';
  
  age: string;         
  gender: 'MALE' | 'FEMALE' | '';
  height: string;      
  weight: string;      
  unitSystem: 'METRIC' | 'IMPERIAL' | '';
  
  planType: 'CUTTING' | 'BULKING' | 'RECOMP' | '';
  preferences: string; 
}