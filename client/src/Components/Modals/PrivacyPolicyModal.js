import React from "react";
import { PolicyDialog } from "../PublicSite/PolicyView";
export default function PrivacyPolicyModal({showPrivacyModal,setShowPrivacyModal}){return <PolicyDialog kind={showPrivacyModal?"privacy":null} onClose={()=>setShowPrivacyModal(false)}/>;}
