import { getContents, isPublicAccess } from "@/solid/queries";
import {
    isContainer
} from "@inrupt/solid-client";
import { useQuery } from "@tanstack/react-query";

import { useState } from "react";
import Image from 'next/image';


interface ResourceProps {
    url: string
    prefix: string,
    setFile: (url: string) => void,
    selectedFile: string | undefined,
    isRoot?: boolean
}


export default function Resource({ url, prefix, setFile, selectedFile, isRoot = false }: ResourceProps) {

    const [expanded, setExpanded] = useState(isRoot)

    const { data: contents, isPending } = useQuery({ 
        queryKey: ['contents', url],
        queryFn: ({queryKey}) => getContents(queryKey[1] as string),
        enabled: expanded || isRoot,
        initialData: []
      })

    const { data: isPublic } = useQuery({ 
        queryKey: ['is_public', url],
        queryFn: ({queryKey}) => isPublicAccess(queryKey[1] as string),
        enabled: !isRoot,
        initialData: false
    })
    
    async function toggleResources() {
        if (expanded) {
            setExpanded(false)
        } else {
            setExpanded(true)
        }
    }

    return <>
        <div
            className={"flex flex-row truncate p-2 gap-2" + (selectedFile == url ? " text-sky-400" : "") + (isPending ? " animate-pulse" : "")}>
                {isContainer(url) ?
                    <span> 
                        <button className="hover:text-sky-200" onClick={() => toggleResources()}>
                            <span className="pr-2">{expanded ? '⏷' : '⏵'}</span>
                        </button>
                        <button className="hover:text-sky-200" onClick={() => setFile(url)}>
                            {isRoot ? '/' : url.replace(prefix, '')}
                        </button>
                    </span>

                    :
                    <button className="hover:text-sky-200" onClick={() => setFile(url)}>
                        <span className="pr-2">■</span>{url.replace(prefix, '')}
                    </button>
                }
                { isPublic &&
                    <span className="inline-flex items-baseline w-4">
                        <Image className="invert" src="globe.svg" alt="Globe icon" width={20} height={20}/>
                    </span>
                }
        </div>
        
        {expanded && <ul>{
            contents.map((c) => <li key={c} className="pl-4">
                <Resource
                    url={c}
                    prefix={url}
                    setFile={setFile}
                    selectedFile={selectedFile} />
            </li>)
        }
        </ul>
        }

    </>
}