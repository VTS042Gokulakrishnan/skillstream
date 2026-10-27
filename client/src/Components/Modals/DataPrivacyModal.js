import React from "react";
import { PolicyDialog } from "../PublicSite/PolicyView";
export default function DataPrivacyModal({showDataPrivacyModal,setShowDataPrivacyModal}){return <PolicyDialog kind={showDataPrivacyModal?"security":null} onClose={()=>setShowDataPrivacyModal(false)}/>;}
