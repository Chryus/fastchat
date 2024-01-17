import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
} from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { useOutletContext } from "@remix-run/react";
import { SupabaseOutletContext } from "~/root";
import * as styles from "./login.css";

export default function Login() {
  const { supabase } = useOutletContext<SupabaseOutletContext>();

  const handleLogin = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: "github",
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Navbar shouldHideOnScroll>
      <NavbarBrand>
        <p className={styles.NavBrand}>FastChat</p>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link color="foreground" href="#">
            Features
          </Link>
        </NavbarItem>
        <NavbarItem isActive>
          <Link href="#" aria-current="page">
            Customers
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#">
            Integrations
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
          <Link href="#">Login</Link>
        </NavbarItem>
        <NavbarItem>
          <div className="flex flex-wrap gap-4 items-center">
            <Button color="primary" onClick={handleLogout}>
              Logout
            </Button>
            <Button color="primary" onClick={handleLogin}>
              Login
            </Button>
          </div>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
