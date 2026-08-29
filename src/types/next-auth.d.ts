import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: "TENANT" | "LANDLORD";
  }

  interface Session {
    user: {
      id: string;
      role: "TENANT" | "LANDLORD";
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "TENANT" | "LANDLORD";
  }
}
