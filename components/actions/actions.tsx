import { useRef, useState} from "react";
import { isContainer } from "@inrupt/solid-client";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFolder, deleteResource, setPublic, uploadFile } from "@/solid/mutations";
import { parent } from "@/solid/utils"
import { isPublicAccess } from "@/solid/queries";



interface ActionProps {
    url: string | undefined
}


export default function Actions({ url = "" }: ActionProps) {

    const [copyText, setCopyText] = useState("Copy URL")

    const queryClient = useQueryClient()

    const deleteResourceMut = useMutation({
        mutationFn: deleteResource,
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: ['contents', parent(url)] })
            queryClient.refetchQueries({ queryKey: ['file', url] })
        },
    })

    const createContainerMut = useMutation({
        mutationFn: createFolder,
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: ['contents', parent(url)] })
        },
    })

    const uploadFileMut = useMutation({
        mutationFn: uploadFile,
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: ['contents', parent(url)] })
        },
    })

    const setPublicMut = useMutation({
        mutationFn: setPublic,
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: ['is_public', url] })
        },
    })

    const { data: isPublic } = useQuery({ 
        queryKey: ['is_public', url],
        queryFn: ({queryKey}) => isPublicAccess(queryKey[1] as string),
        enabled: !!url,
    })

    const fileInput = useRef<any>(null)
    const [folderName, setFolderName] = useState("")
    const [folderInputHidden, setFolderInputHidden] = useState(true)

    const handleFile = () => {
        if (fileInput) {
            fileInput.current.click()
        }
    }

    const handleFileChange = (event: any) => {
        let file = event.target.files[0]
        uploadFileMut.mutate({url, file})
    }

    async function handleDelete() {
        let canDelete = confirm("Are you sure you want to delete: " + url + "?")
        if (canDelete) {
            deleteResourceMut.mutate(url)
        }
    }

    async function handleShare(read: boolean) {
        setPublicMut.mutate({url, read})
    }

    function handleCopy() {
        navigator.clipboard.writeText(url)
        setCopyText("Copied!")
        setTimeout(() => {
            setCopyText("Copy URL")
        }, 1000)
    }

    async function handleNewFolder() {
        createContainerMut.mutate(url + folderName)
        clearNewFolder()

    }

    function clearNewFolder() {
        setFolderName("")
        setFolderInputHidden(true)
    }



    return (<div className="text-xs m-1">
            <button disabled={!url} className="underline p-1 opacity-60 enabled:hover:opacity-100" onClick={() => handleCopy()}>{copyText}</button>
            { !isContainer(url) && 
                ( isPublic ? 
                    <button disabled={!url || isPublic == undefined} className="underline p-1 opacity-60 enabled:hover:opacity-100" onClick={() => { handleShare(false) }}>Make Private</button>
                :
                    <button disabled={!url || isPublic == undefined} className="underline p-1 opacity-60 enabled:hover:opacity-100" onClick={() => { handleShare(true) }}>Make Public</button>
                )
            }
            
            { isContainer(url) && <>
                <button disabled={!url} className="underline p-1 opacity-60 enabled:hover:opacity-100" onClick={() => { handleFile() }}>Upload</button>
                <button disabled={!url} className="underline p-1 opacity-60 enabled:hover:opacity-100" onClick={() => { setFolderInputHidden(false) }}>New Folder</button>

                </> }
            
            <button disabled={!url} className="underline p-1 opacity-60 enabled:hover:opacity-100" onClick={() => handleDelete()}>Delete</button>
        <input className="hidden" type="file"
            onChange={(e) => handleFileChange(e)}
            ref={fileInput} />
        <div className={folderInputHidden ? "hidden": "p-1"}>
            <input value={folderName} className="text-black focus:outline-none px-2" type="text"
            onChange={(e) => setFolderName(e.target.value)}
            />
            <button className="ml-1 px-1 bg-gray-200 text-gray-600" onClick={() => handleNewFolder()}>Create</button>
            <button className="ml-1 px-1 border-none text-red-500" onClick={() => clearNewFolder()}>x</button>
            </div>
 
    </div>
    )

}
