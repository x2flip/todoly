// import { ChevronDownIcon } from '@heroicons/react/solid';
import { Menu, Transition } from "@headlessui/react";
import { signOut } from "next-auth/react";
interface UserAvatarProps {
  image: string;
}
export const UserAvatar = ({ image }: UserAvatarProps) => {
  return (
    <Menu as="div" className={"relative flex items-center"}>
      <Menu.Button className="ring-6urple-400 mr-4 h-12 w-12 self-center rounded-full ring-2">
        <img alt="profile" className="rounded-full" src={image} />
      </Menu.Button>
      <Menu.Items className="absolute right-4 top-14 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-stone-600 text-stone-100 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        <Menu.Item>
          {({ active }: any) => (
            <button
              className={`${
                active ? "bg-violet-700 text-stone-100" : "text-stone-100"
              } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
              onClick={() => signOut()}
            >
              Sign Out
            </button>
          )}
        </Menu.Item>
      </Menu.Items>
      {/* </div> */}
    </Menu>
    // </div>
  );
};
