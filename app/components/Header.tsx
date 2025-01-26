import { useSession, signIn, signOut } from 'next-auth/react';

export default function Header() {
    const { data: session } = useSession();

    return (
        <div>
            {session ? (
                <button onClick={() => signOut()}>로그아웃</button>
            ) : (
                <button onClick={() => signIn()}>로그인</button>
            )}
        </div>
    );
}
