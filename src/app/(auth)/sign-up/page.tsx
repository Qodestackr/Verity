import { useCurrency } from "@/hooks/useCurrency";
import { SignUp } from "@/components/auth/sign-up";

export default function Page() {

    return (
        <div className="max-w-3xl mx-auto">
            <SignUp />
        </div>
    );
}