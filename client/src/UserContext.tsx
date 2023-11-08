import axios from "axios";
import {
  createContext,
  ReactNode,
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
} from "react";

interface UserContextProps {
  children: ReactNode;
}

interface UserContextType {
  username: string | null;
  setUsername: Dispatch<SetStateAction<string | null>>;
  id: string | null;
  setId: Dispatch<SetStateAction<string | null>>;
}

export const UserContext = createContext<UserContextType>({
  username: null,
  setUsername: () => {},
  id: null,
  setId: () => {},
});

export function UserContextProvider({ children }: UserContextProps) {
  const [username, setUsername] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);

  useEffect((): void => {
    axios
      .get("/profile")
      .then((response) => {
        setId(response.data.userId);
        setUsername(response.data.username);
        console.log(id, username, "userContext", response.data);
      })
      .catch((error) => {
        console.log("error on userContext: ", error);
      });
  }, []);

  return (
    <UserContext.Provider value={{ username, setUsername, id, setId }}>
      {children}
    </UserContext.Provider>
  );
}
