import { type NextPage } from "next";
import Head from "next/head";
import { api } from "../utils/api";
import { Dispatch, Fragment, SetStateAction, useState } from "react";
import { Todo } from "@prisma/client";
import { signIn, useSession } from "next-auth/react";
import { UserAvatar } from "../components/UserAvatar";
import { Transition, Dialog } from "@headlessui/react";
import { StringValidation } from "zod";

const Home: NextPage = () => {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      signIn();
    },
  });
  const { data, isLoading } = api.todo.getAll.useQuery();
  return (
    <>
      <Head>
        <title>Todo Speedrun</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="relative flex min-h-screen flex-col items-center bg-stone-900 text-stone-100">
        <div className="absolute top-0 right-0 pt-4">
          {session?.user?.image && <UserAvatar image={session.user.image} />}
        </div>
        <Title />
        {status === "loading" && <LoadingSpinner />}
        {status === "authenticated" && (
          <>
            <AddTodo />
            <div className="flex w-screen flex-col space-y-6 overflow-y-auto px-2">
              {isLoading && <LoadingSpinner />}
              {data && data.length === 0 && (
                <h2 className="text-center text-lg">Add some todos!</h2>
              )}
              {data &&
                data.map((todo) => <TodoCard key={todo.id} todo={todo} />)}
            </div>
          </>
        )}
      </main>
    </>
  );
};

export default Home;

export const LoadingSpinner = () => {
  return (
    <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-stone-100 bg-transparent"></div>
  );
};

export const Title = () => {
  return (
    <div className="pt-24">
      <span className="text-5xl font-bold tracking-wider">t</span>
      <span className="text-5xl font-bold tracking-wider text-stone-400">
        o
      </span>
      <span className="text-5xl font-bold tracking-wider text-stone-100">
        d
      </span>
      <span className="text-5xl font-bold tracking-wider text-stone-400">
        o
      </span>
      <span className="text-5xl font-bold tracking-wider text-stone-100">
        l
      </span>
      <span className="text-5xl font-bold tracking-wider text-stone-100">
        y
      </span>
    </div>
  );
};

export const AddTodo = () => {
  const [addTodoInput, setAddTodoInput] = useState("");
  const utils = api.useContext();
  const addTodo = api.todo.createNewTodo.useMutation({
    onSuccess() {
      utils.todo.getAll.invalidate();
      setAddTodoInput("");
    },
  });
  const handleSubmit = (e: any) => {
    e.preventDefault();
    addTodo.mutate({ task: addTodoInput });
  };
  return (
    <form className="py-14" onSubmit={(e) => handleSubmit(e)}>
      <div className="w-full rounded-md border-2 border-stone-400 bg-stone-900 ring-0 focus:border-blue-700/50 focus:bg-stone-700/10 focus:outline-none focus:ring-0">
        <input
          value={addTodoInput}
          onChange={(e) => setAddTodoInput(e.target.value)}
          className=" bg-transparent py-2 px-4 focus:outline-none"
        />
        <button type="submit" value={addTodoInput} className="mr-4 text-2xl">
          {addTodo.isLoading ? <LoadingSpinner /> : "+"}
        </button>
      </div>
    </form>
  );
};

interface TodoCardProps {
  todo: Todo;
}

export const TodoCard = ({ todo }: TodoCardProps) => {
  let [isEditOpen, setIsEditOpen] = useState(false);

  function openModal() {
    setIsEditOpen(true);
  }
  return (
    <div className="flex w-full space-x-4 rounded-sm border border-stone-800 p-2 shadow-md">
      <span
        className={`flex-grow ${
          !todo.active && "text-stone-500 line-through"
        } truncate`}
      >
        {todo.task}
      </span>
      <CheckoffTodo id={todo.id} active={!todo.active} />
      <EditTodoModal
        id={todo.id}
        task={todo.task}
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
      />
      <button
        onClick={() => openModal()}
        className="rounded-sm px-2 text-stone-400 shadow-md transition-all duration-500 hover:bg-stone-800"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
          />
        </svg>
      </button>
      <DeleteTodo id={todo.id} />
    </div>
  );
};

export const CheckoffTodo = ({
  id,
  active,
}: {
  id: number;
  active: boolean;
}) => {
  const utils = api.useContext();
  const completeTodo = api.todo.inactivateTask.useMutation({
    onSuccess() {
      utils.todo.getAll.invalidate();
    },
  });
  completeTodo.isLoading && <LoadingSpinner />;
  return (
    <input
      type={"checkbox"}
      checked={active}
      className="w-4 accent-emerald-800/70"
      onChange={() => completeTodo.mutate({ id, active })}
    />
  );
};

export const DeleteTodo = ({ id }: { id: number }) => {
  const utils = api.useContext();
  const deleteTodo = api.todo.deleteTask.useMutation({
    onSuccess() {
      utils.todo.getAll.invalidate();
    },
  });
  return (
    <button
      onClick={() => deleteTodo.mutate({ id })}
      className="text-red-700 shadow-md transition duration-300 hover:text-red-800"
    >
      {deleteTodo.isLoading ? (
        <LoadingSpinner />
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
          />
        </svg>
      )}
    </button>
  );
};

interface EditTodoModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  task: string;
  id: number;
}

const EditTodoModal = ({ isOpen, setIsOpen, task, id }: EditTodoModalProps) => {
  const utils = api.useContext();
  const [taskText, setTaskText] = useState(task);
  const updateTodo = api.todo.changeTodo.useMutation({
    onSuccess() {
      utils.todo.getAll.invalidate();
    },
  });
  const handleSubmit = (e: any) => {
    e.preventDefault();
    updateTodo.mutate({ id, task: taskText });
    setIsOpen(false);
  };
  console.log(task);
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => setIsOpen(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-stone-900 p-6 text-left align-middle text-stone-100 shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="mb-10 text-2xl font-medium leading-6"
                >
                  Edit Todo
                </Dialog.Title>
                <form
                  className="flex flex-col space-y-6"
                  onSubmit={(e) => handleSubmit(e)}
                >
                  <textarea
                    value={taskText}
                    onChange={(e) => setTaskText(e.target.value)}
                    className="bg-stone-800/50 px-4 py-2"
                  />
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md border-2 border-emerald-800 px-4 py-2 text-emerald-700 transition duration-300 hover:border-emerald-600 hover:text-emerald-500"
                  >
                    {updateTodo.isLoading ? "Editing..." : "Edit"}
                  </button>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
