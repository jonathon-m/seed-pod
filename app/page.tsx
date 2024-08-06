'use client'

import { useEffect } from "react";
import ResourceView from "@/components/resourceView/resourceView";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPods, getWebId, handleRedirectAfterLogin } from "@/solid/queries";
import { handleLogout, loginToSelectedIdp } from "@/solid/mutations";
import Image from 'next/image';

const SELECTED_IDP = "https://login.inrupt.com/"

export default function Home() {

  const queryClient = useQueryClient()

  const { data: sessionId, isLoading: isLoadingSession } = useQuery({ queryKey: ['session'], queryFn: handleRedirectAfterLogin })

  const { data: webId, isLoading: isLoadingWebId } = useQuery({ queryKey: ['webId', sessionId], queryFn: getWebId })

  const { data: pods, isLoading: isLoadingPods } = useQuery({
    queryKey: ['pods', webId],
    queryFn: ({ queryKey }) => getPods(queryKey[1] as string),
    enabled: !!webId
  })

  const loginMut = useMutation({
    mutationFn: loginToSelectedIdp,
  })

  const logoutMut = useMutation({
    mutationFn: handleLogout,
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['webId'] })
    },
  })

  useEffect(() => {
    if (window != undefined) {
      handleRedirectAfterLogin()
    }
  }, [])


  return (
    <main className="min-h-screen max-h-screen font-mono text-sm">

      <div className="w-full bg-gray-500 flex flex-row place-content-center gap-4 p-2 pl-4 pr-4">
        <div className='flex flex-grow gap-4 overflow-hidden text-nowrap'>
            <Image className="invert" src="seedpod.svg" alt="SeedPod logo" width={15} height={15}/>
          <div className="hidden md:block">{pods && pods.length > 0 && pods[0]}</div>
        </div>
        {webId ? <>
          <div className="flex">{webId.split('/').pop()}</div>
          |
          <button className="flex flex-row hover:text-gray-600 underline" onClick={() => logoutMut.mutate()}>Logout</button>

        </>
          :
          <>
          <button disabled={loginMut.isPending} className="flex flex-row hover:text-gray-600 underline" onClick={() => loginMut.mutate(SELECTED_IDP)}>Login</button>
          </>
        }
      </div>

      <div className="flex grow flex-col md:flex-row w-full h-[calc(100vh-2.5rem)]">
        {pods && pods.length > 0 ?
          <ResourceView pod={pods[0]} /> :
          <div className="text-center mt-[30vh] w-full">
            { (isLoadingSession || isLoadingPods || isLoadingWebId) ? <button>Loading pods..<span className="animate-blink">.</span></button> :
              <>{loginMut.isPending ?        
                <button>
                    Logging in..<span className="animate-blink">.</span>
                  </button>
                  :
                  <><button className="hover:text-gray-600 underline" onClick={() => loginMut.mutate(SELECTED_IDP)}>Login</button> to see your pod</>
       
              }</>
            }
          </div>
          }
      </div>
    </main>
  );
}
