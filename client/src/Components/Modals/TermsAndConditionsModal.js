import React from "react";
import { PolicyDialog } from "../PublicSite/PolicyView";
export default function TermsAndConditionsModal({showTermsModal,setShowTermsModal}){return <PolicyDialog kind={showTermsModal?"terms":null} onClose={()=>setShowTermsModal(false)}/>;}
