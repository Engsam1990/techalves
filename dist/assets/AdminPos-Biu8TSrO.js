import{j as e}from"./query-2uT8UpRa.js";import{r as u,X as ke,a2 as Ae,k as qe,D as Re,E as $e,F as Ie}from"./icons-CCY-ynKV.js";import{L as De}from"./react-CFOkGXWf.js";import{a as ne}from"./adminApi-CLKGj3bh.js";import{f as j}from"./products-BzvMkjSF.js";import{B as q,z as ve,C as F,e as ee,f as te,g as se}from"./index-DbZ3k_PX.js";import{I as A}from"./input-D2aZYkkE.js";import{L as y}from"./label-BC0InuQz.js";import{S as pe,a as xe,b as he,c as fe,d as ce}from"./select-Bjklb9QS.js";import{D as Te,a as Le,b as Oe,c as Ee,d as Qe,f as Be}from"./dropdown-menu-BYRrUUdV.js";import{T as oe}from"./textarea-BJT4puJK.js";import{S as ze}from"./skeleton-D8wLHKfw.js";import{C as Ue}from"./checkbox-Bt5FbnHq.js";import{s as D}from"./site-B6PVLhN1.js";import{D as Ve,a as We,b as _e,c as He,d as Ke,e as Xe}from"./dialog-CiC_gSRC.js";import"./ui-ByR6n09w.js";import"./index-D-g-5a1C.js";import"./Combination-7Xawc5jR.js";import"./index-rg5En1x-.js";import"./index-DNvw_oM6.js";import"./index-CkqvkQjm.js";const Ye=({items:i,orderSummary:d,saleForm:o,totalAmount:g,onClose:r})=>{const b=u.useRef(null),P=g,R=Math.max(0,Number(d?.discountAmount??o.discountAmount??0)),N=Math.max(0,Number(d?.otherCharges??o.otherCharges??0)),T=Math.max(0,P-R+N),f=Math.max(0,Number(d?.vatAmount??(o.vatEnabled?Math.round(T*(Number(o.vatRate||16)/100)):0))),M=T+f,l=R>0,S=N>0,v=f>0,O=l?`-${j(R)}`:"0",B=S?`+${j(N)}`:"0",Q=v?j(f):"0",V=()=>{if(b.current){const a=window.open("","","height=600,width=800");a&&(a.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>POS Receipt</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 20px;
                  background-color: #fff;
                }
                .receipt {
                  max-width: 400px;
                  margin: 0 auto;
                  border: 1px solid #ddd;
                  padding: 20px;
                  background-color: #fff;
                }
                .header {
                  text-align: center;
                  border-bottom: 2px solid #000;
                  padding-bottom: 10px;
                  margin-bottom: 15px;
                }
                .header h1 {
                  margin: 0;
                  font-size: 18px;
                  font-weight: bold;
                }
                .header p {
                  margin: 5px 0;
                  font-size: 12px;
                  color: #666;
                }
                .order-info {
                  font-size: 12px;
                  margin-bottom: 15px;
                  padding-bottom: 10px;
                  border-bottom: 1px solid #ddd;
                }
                .order-info-row {
                  display: flex;
                  justify-content: space-between;
                  margin: 3px 0;
                }
                .items-section {
                  margin-bottom: 15px;
                }
                .items-header {
                  display: flex;
                  justify-content: space-between;
                  font-size: 12px;
                  font-weight: bold;
                  border-bottom: 1px solid #ddd;
                  padding-bottom: 5px;
                  margin-bottom: 10px;
                }
                .item {
                  display: flex;
                  justify-content: space-between;
                  font-size: 12px;
                  margin-bottom: 8px;
                }
                .item-left {
                  flex: 1;
                }
                .item-right {
                  text-align: right;
                  margin-left: 10px;
                }
                .item-name {
                  font-weight: 500;
                }
                .item-details {
                  font-size: 11px;
                  color: #666;
                }
                .totals {
                  margin: 15px 0;
                  padding: 10px 0;
                  border-top: 1px solid #ddd;
                  border-bottom: 2px solid #000;
                }
                .total-row {
                  display: flex;
                  justify-content: space-between;
                  font-size: 12px;
                  margin: 5px 0;
                }
                .total-row.grand-total {
                  font-size: 14px;
                  font-weight: bold;
                  margin-top: 10px;
                }
                .payment-info {
                  font-size: 12px;
                  margin-bottom: 15px;
                  padding-bottom: 10px;
                  border-bottom: 1px solid #ddd;
                }
                .payment-row {
                  display: flex;
                  justify-content: space-between;
                  margin: 3px 0;
                }
                .customer-info {
                  font-size: 12px;
                  margin-bottom: 15px;
                  padding-bottom: 10px;
                  border-bottom: 1px dashed #ddd;
                }
                .customer-row {
                  display: flex;
                  justify-content: space-between;
                  margin: 3px 0;
                }
                .footer {
                  text-align: center;
                  font-size: 11px;
                  color: #666;
                  margin-top: 15px;
                }
                .divider {
                  border-bottom: 1px dashed #ddd;
                  margin: 10px 0;
                }
                @media print {
                  body {
                    margin: 0;
                    padding: 0;
                  }
                  .receipt {
                    border: none;
                    max-width: 100%;
                  }
                }
              </style>
            </head>
            <body>
              <div class="receipt">
                <div class="header">
                  <h1>${D.businessName}</h1>
                  <p>${D.location}</p>
                  <p>${D.businessHours}</p>
                  <p>${D.supportPhoneDisplay}</p>
                </div>

                <div class="order-info">
                  <div class="order-info-row">
                    <span>Receipt ID:</span>
                    <span>#${String(d?.id||"").slice(0,8).toUpperCase()}</span>
                  </div>
                  <div class="order-info-row">
                    <span>Date:</span>
                    <span>${new Date().toLocaleString()}</span>
                  </div>
                </div>

                <div class="items-section">
                  <div class="items-header">
                    <span style="flex: 1">Item</span>
                    <span style="width: 40px">Qty</span>
                    <span style="width: 60px; text-align: right">Total</span>
                  </div>
                  ${i.map(n=>`
                    <div class="item">
                      <div class="item-left">
                        <div class="item-name">${n.product.name}</div>
                        <div class="item-details">
                          ${n.product.brand}${n.product.brand?" • ":""}
                          ${j(n.product.price)} each
                        </div>
                        
                      </div>
                      <div class="item-right">
                        <div style="width: 40px; text-align: center">${n.quantity}</div>
                        <div style="width: 60px; text-align: right">${j(n.product.price*n.quantity)}</div>
                      </div>
                    </div>
                  `).join("")}
                </div>

                <div class="totals">
                  <div class="total-row">
                    <span>Subtotal:</span>
                    <span>${j(P)}</span>
                  </div>
                  <div class="total-row">
                    <span>Discount:</span>
                    <span>${O}</span>
                  </div>
                  <div class="total-row" style="font-size: 11px;">
                    <span>Other charges:</span>
                    <span>${B}</span>
                  </div>
                  <div class="total-row" style="font-size: 11px;">
                    <span>VAT:</span>
                    <span>${Q}</span>
                  </div>
                  <div class="total-row grand-total">
                    <span>TOTAL:</span>
                    <span>${j(M)}</span>
                  </div>
                </div>

                <div class="payment-info">
                  <div class="payment-row">
                    <span>Method:</span>
                    <span>${String(o.paymentMethod).replace(/_/g," ").toUpperCase()}</span>
                  </div>
                  <div class="payment-row">
                    <span>Status:</span>
                    <span>${String(o.paymentStatus).toUpperCase()}</span>
                  </div>
                  ${o.transactionReference?`
                    <div class="payment-row">
                      <span>Reference:</span>
                      <span>${o.transactionReference}</span>
                    </div>
                  `:""}
                </div>

                ${o.customerName||o.customerPhone?`
                  <div class="customer-info">
                    ${o.customerName?`<div class="customer-row"><span>Customer:</span><span>${o.customerName}</span></div>`:""}
                    ${o.customerPhone?`<div class="customer-row"><span>Phone:</span><span>${o.customerPhone}</span></div>`:""}
                  </div>
                `:""}

                <div class="footer">
                  <p>Thank you for your purchase!</p>
                  <p>${D.businessName}</p>
                </div>
              </div>
            </body>
          </html>
        `),a.document.close(),a.print())}};return e.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4",children:e.jsxs("div",{className:"w-full max-w-md rounded-lg bg-white shadow-lg",children:[e.jsxs("div",{className:"flex items-center justify-between border-b p-4",children:[e.jsx("h2",{className:"text-lg font-semibold",children:"POS Receipt"}),e.jsx("button",{onClick:r,className:"rounded-lg p-1 hover:bg-muted",children:e.jsx(ke,{className:"h-5 w-5"})})]}),e.jsxs("div",{ref:b,className:"max-h-[60vh] overflow-y-auto bg-white p-6 text-xs",style:{fontFamily:"monospace"},children:[e.jsxs("div",{className:"space-y-2 text-center",children:[e.jsx("h3",{className:"text-sm font-bold",children:D.businessName}),e.jsx("p",{className:"text-xs text-muted-foreground",children:D.location}),e.jsx("p",{className:"text-xs text-muted-foreground",children:D.businessHours}),e.jsx("p",{className:"text-xs text-muted-foreground",children:D.supportPhoneDisplay})]}),e.jsxs("div",{className:"my-2 border-t border-b py-2 text-xs",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{children:"Receipt ID:"}),e.jsxs("span",{className:"font-semibold",children:["#",String(d?.id||"").slice(0,8).toUpperCase()]})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{children:"Date:"}),e.jsx("span",{children:new Date().toLocaleString()})]})]}),e.jsxs("div",{className:"my-3 space-y-2 text-xs",children:[e.jsxs("div",{className:"flex justify-between border-b pb-1 text-xs font-semibold",children:[e.jsx("span",{style:{flex:1},children:"Item"}),e.jsx("span",{style:{width:"40px"},children:"Qty"}),e.jsx("span",{style:{width:"60px",textAlign:"right"},children:"Total"})]}),i.map(a=>e.jsxs("div",{className:"space-y-1",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"font-medium",children:a.product.name}),e.jsx("span",{children:j(a.product.price*a.quantity)})]}),e.jsxs("div",{className:"text-xs text-muted-foreground",children:[a.product.brand," • ",j(a.product.price)," x"," ",a.quantity]})]},a.product.id))]}),e.jsxs("div",{className:"my-3 border-t border-b py-2 text-xs font-semibold",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{children:"Subtotal:"}),e.jsx("span",{children:j(P)})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{children:"Discount:"}),e.jsx("span",{children:O})]}),e.jsxs("div",{className:"mt-1 flex justify-between text-xs",children:[e.jsx("span",{children:"Other charges:"}),e.jsx("span",{children:B})]}),e.jsxs("div",{className:"mt-1 flex justify-between text-xs",children:[e.jsx("span",{children:"VAT:"}),e.jsx("span",{children:Q})]}),e.jsxs("div",{className:"mt-1 flex justify-between text-sm",children:[e.jsx("span",{children:"TOTAL:"}),e.jsx("span",{className:"text-base text-primary",children:j(M)})]})]}),e.jsxs("div",{className:"my-2 space-y-1 text-xs",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{children:"Payment Method:"}),e.jsx("span",{className:"font-medium",children:String(o.paymentMethod).replace(/_/g," ").toUpperCase()})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{children:"Status:"}),e.jsx("span",{className:"font-medium",children:String(o.paymentStatus).toUpperCase()})]}),o.transactionReference&&e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{children:"Reference:"}),e.jsx("span",{className:"font-medium",children:o.transactionReference})]})]}),(o.customerName||o.customerPhone)&&e.jsxs("div",{className:"my-2 border-t border-b py-2 text-xs",children:[o.customerName&&e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{children:"Customer:"}),e.jsx("span",{children:o.customerName})]}),o.customerPhone&&e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{children:"Phone:"}),e.jsx("span",{children:o.customerPhone})]})]}),e.jsxs("div",{className:"mt-4 text-center text-xs text-muted-foreground",children:[e.jsx("p",{children:"Thank you for your purchase!"}),e.jsx("p",{className:"mt-1",children:D.businessName})]})]}),e.jsxs("div",{className:"flex gap-2 border-t p-4",children:[e.jsx(q,{onClick:V,className:"flex-1",variant:"highlight",children:"Print Receipt"}),e.jsx(q,{onClick:r,className:"flex-1",variant:"outline",children:"Close"})]})]})})},U="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",ge={name:"",categoryId:"",subcategory:"",brand:"",barcode:"",condition:"new",description:"",warrantyText:"",sourceId:"",sourcePrice:0,sellingPrice:0,sourcePaymentStatus:"pending",quantity:1,serialNumbersText:""};function Ge(i){return i.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,80)||"instant-sale-product"}function Je(i){return Array.from(new Set(String(i||"").split(/\r?\n|,/).map(d=>d.trim()).filter(Boolean)))}function ae(i){return i.isActive!==!1}function Ze({open:i,onOpenChange:d,onCreated:o}){const{toast:g}=ve(),[r,b]=u.useState(ge),[P,R]=u.useState([]),[N,T]=u.useState({}),[f,M]=u.useState(!1),l=u.useMemo(()=>P.filter(ae),[P]),S=u.useMemo(()=>(N.categories||[]).filter(ae),[N.categories]),v=u.useMemo(()=>(N.brands||[]).filter(ae),[N.brands]),O=u.useMemo(()=>(N.subcategories||[]).filter(a=>ae(a)&&a.categoryId===r.categoryId),[N.subcategories,r.categoryId]),B=v.find(a=>a.id===r.brand),Q=()=>b(ge);u.useEffect(()=>{if(!i){Q();return}let a=!0;return M(!0),Promise.all([ne.getSources({active:"1"}),ne.getCatalog()]).then(([n,k])=>{a&&(R(Array.isArray(n)?n:[]),T({categories:Array.isArray(k?.categories)?k.categories:[],subcategories:Array.isArray(k?.subcategories)?k.subcategories:[],brands:Array.isArray(k?.brands)?k.brands:[]}))}).catch(n=>{a&&g({title:"Could not load POS options",description:n.message||"Confirm suppliers, categories, subcategories, and brands are available.",variant:"destructive"})}).finally(()=>{a&&M(!1)}),()=>{a=!1}},[i,g]);const V=()=>{const a=r.name.trim(),n=Number(r.sourcePrice||0),k=Number(r.sellingPrice||0);if(!a)return g({title:"Product name required",description:"Enter the instant-sale product name.",variant:"destructive"});if(!r.categoryId)return g({title:"Category required",description:"Select the product category.",variant:"destructive"});if(!r.brand)return g({title:"Brand required",description:"Select the product brand.",variant:"destructive"});if(!r.sourceId)return g({title:"Supplier/source required",description:"Select the supplier/source.",variant:"destructive"});if(n<=0)return g({title:"Source price required",description:"Enter the supplier/source price.",variant:"destructive"});if(k<=0)return g({title:"Selling price required",description:"Enter the customer selling price.",variant:"destructive"});if(!r.sourcePaymentStatus)return g({title:"Source payment status required",variant:"destructive"});const W=Number(r.quantity||0);if(!Number.isFinite(W)||W<1)return g({title:"Quantity required",description:"Enter at least 1 unit for the instant-sale product.",variant:"destructive"});const z=Je(r.serialNumbersText),w=z.length?z.length:Math.max(1,Number(r.quantity||1)),$={name:a,categoryId:r.categoryId,subcategory:r.subcategory||null,brand:r.brand,barcode:r.barcode.trim()||null,condition:r.condition,description:r.description.trim()||null,warrantyText:r.warrantyText.trim()||null,sourceId:r.sourceId,sourcePrice:n,sellingPrice:k,sourcePaymentStatus:r.sourcePaymentStatus},_=`instant-${Date.now()}`;o({id:_,name:a,slug:`${Ge(a)}-${_.slice(-6)}`,brand:B?.name||"Instant sale",barcode:r.barcode.trim()||null,price:k,stockQuantity:w,inStock:!0,images:[],availableSerialNumbers:z,sourceId:r.sourceId,sourcePrice:n,sourcePaymentStatus:r.sourcePaymentStatus,instantProduct:$},w,z),d(!1)};return e.jsx(Ve,{open:i,onOpenChange:d,children:e.jsxs(We,{className:"max-h-[90vh] overflow-y-auto sm:max-w-2xl",children:[e.jsxs(_e,{children:[e.jsx(He,{children:"Add instant-sale product"}),e.jsx(Ke,{children:"POS-only product. It is hidden from catalogue/admin product listing, and sourced by is recorded as the logged-in data entrant."})]}),e.jsxs("div",{className:"grid gap-4 md:grid-cols-2",children:[e.jsxs("div",{className:"space-y-2 md:col-span-2",children:[e.jsxs(y,{children:["Product name ",e.jsx("span",{className:"text-destructive",children:"*"})]}),e.jsx(A,{value:r.name,onChange:a=>b(n=>({...n,name:a.target.value})),placeholder:"Example: Used Dell Latitude charger"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs(y,{children:["Category ",e.jsx("span",{className:"text-destructive",children:"*"})]}),e.jsxs("select",{className:U,value:r.categoryId,onChange:a=>b(n=>({...n,categoryId:a.target.value,subcategory:""})),disabled:f||!S.length,children:[e.jsx("option",{value:"",children:f?"Loading categories...":S.length?"Select category":"No categories found"}),S.map(a=>e.jsx("option",{value:a.id,children:a.name},a.id))]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(y,{children:"Subcategory"}),e.jsxs("select",{className:U,value:r.subcategory,onChange:a=>b(n=>({...n,subcategory:a.target.value})),disabled:f||!r.categoryId||!O.length,children:[e.jsx("option",{value:"",children:r.categoryId?O.length?"No subcategory":"No subcategories for category":"Choose category first"}),O.map(a=>e.jsx("option",{value:a.id,children:a.name},a.id))]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs(y,{children:["Brand ",e.jsx("span",{className:"text-destructive",children:"*"})]}),e.jsxs("select",{className:U,value:r.brand,onChange:a=>b(n=>({...n,brand:a.target.value})),disabled:f||!v.length,children:[e.jsx("option",{value:"",children:f?"Loading brands...":v.length?"Select brand":"No brands found"}),v.map(a=>e.jsx("option",{value:a.id,children:a.name},a.id))]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(y,{children:"Barcode"}),e.jsx(A,{value:r.barcode,onChange:a=>b(n=>({...n,barcode:a.target.value})),placeholder:"Optional barcode"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(y,{children:"Condition"}),e.jsxs("select",{className:U,value:r.condition,onChange:a=>b(n=>({...n,condition:a.target.value})),children:[e.jsx("option",{value:"new",children:"New"}),e.jsx("option",{value:"refurbished",children:"Refurbished"}),e.jsx("option",{value:"ex-uk",children:"Ex-UK"})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs(y,{children:["Supplier / source ",e.jsx("span",{className:"text-destructive",children:"*"})]}),e.jsxs("select",{className:U,value:r.sourceId,onChange:a=>b(n=>({...n,sourceId:a.target.value})),disabled:f||!l.length,children:[e.jsx("option",{value:"",children:f?"Loading suppliers...":l.length?"Select supplier/source":"No suppliers found"}),l.map(a=>e.jsx("option",{value:a.id,children:a.name},a.id))]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs(y,{children:["Source price ",e.jsx("span",{className:"text-destructive",children:"*"})]}),e.jsx(A,{type:"number",min:1,value:r.sourcePrice,onChange:a=>b(n=>({...n,sourcePrice:Number(a.target.value)||0}))})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs(y,{children:["Selling price ",e.jsx("span",{className:"text-destructive",children:"*"})]}),e.jsx(A,{type:"number",min:1,value:r.sellingPrice,onChange:a=>b(n=>({...n,sellingPrice:Number(a.target.value)||0}))})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs(y,{children:["Source payment status ",e.jsx("span",{className:"text-destructive",children:"*"})]}),e.jsxs("select",{className:U,value:r.sourcePaymentStatus,onChange:a=>b(n=>({...n,sourcePaymentStatus:a.target.value})),children:[e.jsx("option",{value:"pending",children:"Pending"}),e.jsx("option",{value:"paid",children:"Paid"}),e.jsx("option",{value:"partial",children:"Partial"}),e.jsx("option",{value:"waived",children:"Waived"})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs(y,{children:["Quantity ",e.jsx("span",{className:"text-destructive",children:"*"})]}),e.jsx(A,{required:!0,type:"number",min:1,value:r.quantity,onChange:a=>b(n=>({...n,quantity:Math.max(1,Number(a.target.value)||1)}))})]}),e.jsxs("div",{className:"space-y-2 md:col-span-2",children:[e.jsx(y,{children:"Serial numbers"}),e.jsx(oe,{value:r.serialNumbersText,onChange:a=>b(n=>({...n,serialNumbersText:a.target.value})),placeholder:"Optional. One serial number per line or comma-separated.",rows:4}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"When serials are entered, quantity is set from the number of serials."})]}),e.jsxs("div",{className:"space-y-2 md:col-span-2",children:[e.jsx(y,{children:"Description"}),e.jsx(oe,{value:r.description,onChange:a=>b(n=>({...n,description:a.target.value})),placeholder:"Optional internal/product note",rows:3})]})]}),e.jsxs(Xe,{children:[e.jsx(q,{type:"button",variant:"outline",onClick:()=>d(!1),children:"Cancel"}),e.jsx(q,{type:"button",onClick:V,children:"Add to sale"})]})]})})}const be=[{value:"cash",label:"Cash"},{value:"mpesa",label:"M-Pesa"},{value:"card",label:"Card"},{value:"bank_transfer",label:"Bank transfer"},{value:"other",label:"Other"}],de=new Set(["mpesa","card","bank_transfer"]),Fe={paymentStatus:"paid",paymentMethod:"cash",transactionReference:"",discountAmount:0,otherCharges:0,customerName:"",customerPhone:"",note:"",vatEnabled:!1,vatRate:16};function et(i,d){const o=String(i.name||"").toLowerCase(),g=String(i.brand||"").toLowerCase(),r=String(i.barcode||"").toLowerCase(),b=String(i.slug||"").toLowerCase(),P=String(i.id||"").toLowerCase();return d?r&&r===d?120:b===d||P===d||o===d?100:r.startsWith(d)?80:o.startsWith(d)?60:g.startsWith(d)?40:[o,g,r,b,P].some(R=>R.includes(d))?20:0:0}function je(i,d){return i instanceof Error?i.message:d}function tt(i,d){return de.has(i)&&d==="paid"}function ye(i){return i&&typeof i=="object"&&"serialNumber"in i?String(i.serialNumber||""):String(i||"")}function I(i){return Array.from(new Set((i.availableSerialNumbers||[]).map(ye).map(d=>d.trim()).filter(Boolean)))}function re(i,d,o){return o?Array.from(new Set(i.map(g=>g.trim()).filter(Boolean))).slice(0,d):[]}function st(i,d,o){if(!I(i).length)return!0;const g=Array.from(new Set(o.map(r=>r.trim()).filter(Boolean)));return g.length>0&&g.length===d}const wt=()=>{const{toast:i}=ve(),d=u.useRef(null),[o,g]=u.useState(!0),[r,b]=u.useState(!1),[P,R]=u.useState([]),[N,T]=u.useState(""),[f,M]=u.useState([]),[l,S]=u.useState(Fe),[v,O]=u.useState(null),[B,Q]=u.useState(!1),[V,a]=u.useState(!1),[n,k]=u.useState(null),[W,z]=u.useState({});u.useEffect(()=>{let t=!0;return(async()=>{g(!0);try{const h=await ne.getProducts();t&&R(Array.isArray(h)?h:[])}catch(h){t&&i({title:"Error",description:je(h,"Could not load products for POS"),variant:"destructive"})}finally{t&&g(!1)}})(),()=>{t=!1}},[i]),u.useEffect(()=>{o||d.current?.focus()},[o]);const w=u.useMemo(()=>{const t=N.trim().toLowerCase();if(!t)return null;const s=P.filter(m=>String(m.barcode||"").trim().toLowerCase()===t);if(s.length===1)return s[0];const h=P.filter(m=>String(m.name||"").trim().toLowerCase()===t);return h.length===1?h[0]:null},[P,N]),$=u.useMemo(()=>{const t=N.trim().toLowerCase();return t?[...P].map(s=>({product:s,score:et(s,t)})).filter(s=>s.score>0).sort((s,h)=>h.score-s.score||s.product.name.localeCompare(h.product.name)).slice(0,8).map(s=>s.product):[]},[P,N]),_=u.useMemo(()=>f.reduce((t,s)=>t+s.quantity,0),[f]),H=u.useMemo(()=>f.reduce((t,s)=>t+s.product.price*s.quantity,0),[f]),K=u.useMemo(()=>Math.min(Math.max(Number(l.discountAmount||0),0),H),[l.discountAmount,H]),X=u.useMemo(()=>Math.max(0,Number(l.otherCharges||0)),[l.otherCharges]),G=u.useMemo(()=>Math.max(0,H-K+X),[K,X,H]),J=u.useMemo(()=>l.vatEnabled?Math.round(G*(Number(l.vatRate||16)/100)):0,[l.vatEnabled,l.vatRate,G]),Ne=u.useMemo(()=>G+J,[G,J]);u.useMemo(()=>f.filter(t=>I(t.product).length>0).length,[f]);const ue=u.useMemo(()=>de.has(l.paymentMethod),[l.paymentMethod]),ie=u.useMemo(()=>tt(l.paymentMethod,l.paymentStatus),[l.paymentMethod,l.paymentStatus]),L=()=>{d.current?.focus(),d.current?.select()},Z=t=>{if(!(I(t).length>0)&&(!t.inStock||Number(t.stockQuantity||0)<=0)){i({title:"Out of stock",description:`${t.name} is not available right now`,variant:"destructive"}),L();return}let h=!1;if(M(m=>{const c=m.find(p=>p.product.id===t.id);if(!c)return[...m,{product:t,quantity:I(t).length>0?0:1,serialNumbers:re([],I(t).length>0?0:1,I(t).length>0)}];if(I(t).length>0)return m;const x=c.quantity+1;return x>Number(t.stockQuantity||0)?(h=!0,m):m.map(p=>{if(p.product.id!==t.id)return p;const C=re(p.serialNumbers,x,I(p.product).length>0);return{...p,quantity:x,serialNumbers:C}})}),h){i({title:"Stock limit reached",description:`Only ${t.stockQuantity} unit(s) available for ${t.name}`,variant:"destructive"}),L();return}T(""),L()},Se=(t,s,h=[])=>{const m=Array.from(new Set(h.map(p=>p.trim()).filter(Boolean))),c=m.length?m.length:Math.max(1,Number(s||1)),x={...t,stockQuantity:Math.max(Number(t.stockQuantity||0),c),inStock:!0,availableSerialNumbers:m.length?m:t.availableSerialNumbers||[]};R(p=>[x,...p.filter(C=>C.id!==x.id)]),M(p=>[...p.filter(C=>C.product.id!==x.id),{product:x,quantity:c,serialNumbers:m}]),T(""),L()},we=t=>{t.preventDefault();const s=w||($.length===1?$[0]:null);if(!s){i({title:$.length>1?"Multiple products found":"Product not found",description:$.length>1?"Select the correct product from the results below.":"Scan the barcode or type the exact product name.",variant:"destructive"}),L();return}Z(s)},me=(t,s)=>{if(s<=0){M(h=>h.filter(m=>m.product.id!==t)),L();return}M(h=>h.map(m=>{if(m.product.id!==t)return m;const c=Math.min(s,Number(m.product.stockQuantity||0));return{...m,quantity:c,serialNumbers:re(m.serialNumbers,c,I(m.product).length>0)}}))},Ce=t=>{M(s=>s.filter(h=>h.product.id!==t)),L()},Pe=(t,s,h)=>{M(m=>m.map(c=>{if(c.product.id!==t)return c;const x=I(c.product).length,p=re(c.serialNumbers,x,x>0);if(h){if(p.includes(s)||p.length>=x)return c;const E=[...p,s];return{...c,serialNumbers:E,quantity:E.length}}const C=p.filter(E=>E!==s);return{...c,serialNumbers:C,quantity:C.length}}))},Me=async()=>{if(_<=0){i({title:"No products selected",description:"Scan or add at least one product before recording a sale.",variant:"destructive"}),L();return}if(ie&&!l.transactionReference.trim()){i({title:"Transaction reference required",description:"Enter the payment transaction reference for paid M-Pesa, card, or bank transfer sales.",variant:"destructive"});return}const t=f.find(s=>!st(s.product,s.quantity,s.serialNumbers));if(t){i({title:"Serial numbers required",description:`Select a serial number for each unit of ${t.product.name} before checkout.`,variant:"destructive"});return}b(!0);try{const s=await ne.createPosSale({items:f.map(c=>c.product.instantProduct?{quantity:c.quantity,serialNumbers:c.serialNumbers.map(x=>x.trim()).filter(Boolean),instantProduct:c.product.instantProduct}:{productId:c.product.id,quantity:c.quantity,serialNumbers:c.serialNumbers.map(x=>x.trim()).filter(Boolean)}),paymentStatus:l.paymentStatus,paymentMethod:l.paymentMethod,transactionReference:ue&&l.transactionReference.trim()||void 0,discountAmount:K,otherCharges:X,customerName:l.customerName.trim()||void 0,customerPhone:l.customerPhone.trim()||void 0,note:l.note.trim()||void 0,vatEnabled:!!l.vatEnabled,vatRate:Number(l.vatRate||16)}),h=new Map(f.map(c=>[c.product.id,c.quantity])),m=new Map(f.map(c=>[c.product.id,new Set(c.serialNumbers)]));R(c=>c.map(x=>{const p=h.get(x.id);if(!p)return x;const C=Math.max(0,Number(x.stockQuantity||0)-p),E=m.get(x.id)||new Set,le=(x.availableSerialNumbers||[]).map(Y=>ye(Y)).filter(Y=>!!Y).filter(Y=>!E.has(Y));return{...x,stockQuantity:C,inStock:C>0,availableSerialNumbers:le}})),k({items:f.map(({product:c,quantity:x,serialNumbers:p})=>({product:c,quantity:x,serialNumbers:p})),orderSummary:s.order||null,saleForm:l,totalAmount:H}),Q(!0),M([]),T(""),S(c=>({...c,transactionReference:"",discountAmount:0,otherCharges:0,customerName:"",customerPhone:"",note:"",vatEnabled:c.vatEnabled,vatRate:c.vatRate})),O(s.order||null),i({title:"Sale recorded",description:s.message||"POS sale saved successfully"})}catch(s){i({title:"Error",description:je(s,"Could not record POS sale"),variant:"destructive"})}finally{b(!1)}};return o?e.jsx(ze,{className:"h-[560px] w-full rounded-xl"}):e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-2xl font-display font-bold",children:"POS"}),e.jsx("p",{className:"text-muted-foreground",children:"Scan a barcode or search by product name, then record the sale and update stock immediately."})]}),e.jsxs("div",{className:"grid gap-6 xl:grid-cols-[1.15fr_0.85fr]",children:[e.jsxs("div",{className:"space-y-6",children:[e.jsxs(F,{children:[e.jsx(ee,{children:e.jsxs(te,{className:"flex items-center gap-2 text-lg",children:[e.jsx(Ae,{className:"h-5 w-5"}),"Scan Or Search"]})}),e.jsxs(se,{className:"space-y-4",children:[e.jsxs("form",{className:"flex flex-col gap-3 md:flex-row",onSubmit:we,children:[e.jsx(A,{ref:d,value:N,onChange:t=>T(t.target.value),onKeyDown:t=>{if(t.key!=="Enter")return;const s=w||($.length===1?$[0]:null);s&&(t.preventDefault(),Z(s))},placeholder:"Scan barcode or type product name",className:"md:flex-1"}),e.jsxs("div",{className:"flex gap-2 md:w-auto",children:[e.jsx(q,{type:"submit",className:"flex-1 md:flex-none",children:"Add to sale"}),e.jsx(q,{type:"button",variant:"secondary",className:"flex-1 md:flex-none",onClick:()=>a(!0),children:"Add instant sale"})]})]}),e.jsx("div",{className:"rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground",children:"Scanner tip: most barcode scanners type the code and press Enter automatically, so this field is ready for scan-and-add."}),N.trim()?e.jsx("div",{className:"space-y-3",children:w?e.jsxs("button",{type:"button",onClick:()=>Z(w),className:"flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/40",children:[e.jsx("div",{children:w.images?.[0]?e.jsx("img",{src:w.images[0],alt:w.name,className:"h-16 w-16 rounded-lg border object-cover"}):null}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("p",{className:"font-medium",children:w.name}),e.jsxs("p",{className:"text-sm text-muted-foreground",children:[w.brand,w.barcode?` • ${w.barcode}`:""]})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("p",{className:"font-medium",children:j(w.price)}),e.jsxs("p",{className:"text-xs text-muted-foreground",children:[w.stockQuantity," in stock"]})]})]},w.id):$.length?e.jsxs(e.Fragment,{children:[$.length>1?e.jsx("div",{className:"rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground",children:"Multiple products match this search. Select the correct one below."}):null,e.jsx("div",{className:"space-y-2",children:$.map(t=>e.jsxs("button",{type:"button",onClick:()=>Z(t),className:"flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/40",children:[e.jsx("div",{children:t.images?.[0]?e.jsx("img",{src:t.images[0],alt:t.name,className:"h-16 w-16 rounded-lg border object-cover"}):null}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("p",{className:"font-medium",children:t.name}),e.jsxs("p",{className:"text-sm text-muted-foreground",children:[t.brand,t.barcode?` • ${t.barcode}`:""]})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("p",{className:"font-medium",children:j(t.price)}),e.jsxs("p",{className:"text-xs text-muted-foreground",children:[t.stockQuantity," in stock"]})]})]},t.id))})]}):e.jsx("div",{className:"rounded-lg border border-dashed p-4 text-sm text-muted-foreground",children:"No matching products found for this barcode or product name."})}):null]})]}),e.jsxs(F,{children:[e.jsx(ee,{children:e.jsxs(te,{className:"flex items-center gap-2 text-lg",children:[e.jsx(qe,{className:"h-5 w-5"}),"Current Sale",e.jsx("span",{className:"ml-auto text-sm font-normal text-destructive",children:"* Items required"})]})}),e.jsx(se,{className:"space-y-4",children:f.length?e.jsx("div",{className:"space-y-2.5",children:f.map(t=>{const s=I(t.product),h=t.serialNumbers.filter(Boolean).length,m=s.length>0,c=String(W[t.product.id]||"").trim().toLowerCase(),x=c?s.filter(p=>p.toLowerCase().includes(c)):s;return e.jsx("div",{className:"overflow-hidden rounded-lg border bg-card p-2.5 shadow-sm transition-shadow hover:shadow-md",children:e.jsxs("div",{className:"flex items-start gap-2.5",children:[t.product.images?.[0]?e.jsx("img",{src:t.product.images[0],alt:t.product.name,className:"h-12 w-12 shrink-0 rounded-md border object-cover"}):e.jsx("div",{className:"flex h-12 w-12 shrink-0 items-center justify-center rounded-md border bg-muted/40 text-center text-[9px] leading-tight text-muted-foreground",children:"No image"}),e.jsxs("div",{className:"min-w-0 flex-1 space-y-1.5",children:[e.jsxs("div",{className:"flex items-start justify-between gap-2",children:[e.jsxs("div",{className:"min-w-0",children:[e.jsx("p",{className:"truncate text-xs font-semibold leading-4",children:t.product.name}),e.jsxs("p",{className:"truncate text-[11px] leading-4 text-muted-foreground",children:[t.product.brand,t.product.barcode?` • ${t.product.barcode}`:""]}),!m&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"rounded-full bg-muted mx-1 px-2 py-0.5 text-[10px] leading-none text-muted-foreground",children:"Std"}),e.jsxs("span",{className:"rounded-full bg-muted mx-1 px-2 py-0.5 text-[10px] leading-none text-muted-foreground",children:["Stock ",t.product.stockQuantity]})]})]}),e.jsxs("div",{className:"text-right",children:[!m&&e.jsx("div",{className:"flex items-center justify-between gap-2 px-2 py-1.5",children:e.jsxs("div",{className:"flex items-center gap-1",children:[e.jsx(q,{type:"button",variant:"outline",className:"h-7 w-7 rounded-full p-0",onClick:()=>me(t.product.id,t.quantity-1),children:e.jsx(Re,{className:"h-3 w-3"})}),e.jsx("div",{className:"min-w-6 text-center text-xs font-semibold",children:t.quantity}),e.jsx(q,{type:"button",variant:"outline",className:"h-7 w-7 rounded-full p-0",onClick:()=>me(t.product.id,t.quantity+1),disabled:t.quantity>=t.product.stockQuantity,children:e.jsx($e,{className:"h-3 w-3"})})]})}),e.jsxs("p",{className:"text-xs font-semibold leading-4",children:[j(t.product.price)," * ",`${t.quantity} pcs`]}),e.jsx("p",{className:"max-w-[140px] text-[14px] leading-4 text-muted-foreground",children:j(t.product.price*t.quantity)})]})]}),e.jsxs("div",{className:"flex flex-wrap items-center gap-1.5",children:[m&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"rounded-full bg-muted px-2 py-0.5 text-[10px] leading-none text-muted-foreground",children:"Serial"}),e.jsxs("span",{className:"rounded-full bg-muted px-2 py-0.5 text-[10px] leading-none text-muted-foreground",children:["Stock ",t.product.stockQuantity]})]}),m&&t.serialNumbers.length?e.jsx("span",{className:"max-w-[180px] truncate rounded-full bg-muted px-2 py-0.5 text-[10px] leading-none text-muted-foreground",children:t.serialNumbers.join(", ")}):null]}),m&&e.jsxs(Te,{children:[e.jsx(Le,{asChild:!0,children:e.jsxs(q,{type:"button",variant:"outline",className:"h-7 w-full justify-between px-2 text-[11px]",children:[e.jsx("span",{children:"Serials"}),e.jsx("span",{className:"max-w-[180px] truncate text-[10px] text-muted-foreground",children:t.serialNumbers.length?t.serialNumbers.join(", "):"Select serials"})]})}),e.jsx(Oe,{align:"start",className:"w-80",children:e.jsxs("div",{className:"space-y-2 p-2",children:[e.jsx(Ee,{className:"px-0",children:"Choose serial numbers"}),e.jsx(A,{value:W[t.product.id]||"",onChange:p=>z(C=>({...C,[t.product.id]:p.target.value})),placeholder:"Search serial numbers",className:"h-8"}),e.jsx(Qe,{}),e.jsx("div",{className:"max-h-56 space-y-1 overflow-y-auto",children:x.length?x.map(p=>{const C=t.serialNumbers.includes(p),E=!C&&h>=s.length;return e.jsxs(Be,{disabled:E,onSelect:le=>{le.preventDefault(),Pe(t.product.id,p,!C)},className:"flex cursor-pointer items-center justify-between",children:[e.jsx("span",{children:p}),C?e.jsx("span",{className:"text-xs text-primary",children:"Selected"}):null]},`${t.product.id}-serial-${p}`)}):e.jsx("div",{className:"px-2 py-2 text-sm text-muted-foreground",children:"No matching serials found"})})]})})]})]}),e.jsx(q,{type:"button",variant:"ghost",size:"icon",className:"h-7 w-7 shrink-0",onClick:()=>Ce(t.product.id),children:e.jsx(Ie,{className:"h-3.5 w-3.5 text-destructive"})})]})},t.product.id)})}):e.jsx("div",{className:"rounded-2xl border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground",children:e.jsxs("div",{className:"space-y-1",children:[e.jsx("p",{className:"font-medium text-foreground",children:"No products in this sale yet"}),e.jsx("p",{children:"Scan a barcode or search above to add items to the current sale."})]})})})]})]}),e.jsxs("div",{className:"space-y-6",children:[e.jsxs(F,{children:[e.jsx(ee,{children:e.jsx(te,{className:"text-lg",children:"Payment And Checkout"})}),e.jsxs(se,{className:"space-y-4",children:[e.jsxs("div",{className:"grid gap-4 md:grid-cols-2 xl:grid-cols-1",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsxs(y,{children:["Payment status",e.jsx("span",{className:"ml-1 text-destructive",children:"*"})]}),e.jsxs(pe,{value:l.paymentStatus,onValueChange:t=>S(s=>({...s,paymentStatus:t})),children:[e.jsx(xe,{children:e.jsx(he,{})}),e.jsxs(fe,{children:[e.jsx(ce,{value:"paid",children:"Paid"}),e.jsx(ce,{value:"pending",children:"Pending"})]})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs(y,{children:["Payment method",e.jsx("span",{className:"ml-1 text-destructive",children:"*"})]}),e.jsxs(pe,{value:l.paymentMethod,onValueChange:t=>S(s=>({...s,paymentMethod:t,transactionReference:de.has(t)?s.transactionReference:""})),children:[e.jsx(xe,{children:e.jsx(he,{})}),e.jsx(fe,{children:be.map(t=>e.jsx(ce,{value:t.value,children:t.label},t.value))})]})]})]}),ue?e.jsxs("div",{className:"space-y-2",children:[e.jsxs(y,{children:["Transaction reference",ie?e.jsx("span",{className:"ml-1 text-destructive",children:"*"}):null]}),e.jsx(A,{value:l.transactionReference,onChange:t=>S(s=>({...s,transactionReference:t.target.value})),placeholder:"Enter M-Pesa, card, or bank reference"}),e.jsx("p",{className:"text-xs text-muted-foreground",children:ie?"Required because this sale is marked as paid.":"Optional while the payment is still pending."})]}):null,e.jsxs("div",{className:"space-y-2",children:[e.jsx(y,{children:"Customer name"}),e.jsx(A,{value:l.customerName,onChange:t=>S(s=>({...s,customerName:t.target.value})),placeholder:"Optional walk-in customer name"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(y,{children:"Customer phone"}),e.jsx(A,{value:l.customerPhone,onChange:t=>S(s=>({...s,customerPhone:t.target.value})),placeholder:"Optional phone number"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(y,{children:"Sale note"}),e.jsx(oe,{value:l.note,onChange:t=>S(s=>({...s,note:t.target.value})),placeholder:"Optional internal note for this POS sale",rows:4})]}),e.jsxs("div",{className:"rounded-xl border bg-muted/40 p-4",children:[e.jsxs("div",{className:"flex items-center justify-between text-sm",children:[e.jsx("span",{className:"text-muted-foreground",children:"Items"}),e.jsx("span",{children:_})]}),e.jsxs("div",{className:"mt-2 flex items-center justify-between text-sm",children:[e.jsx("span",{className:"text-muted-foreground",children:"Payment"}),e.jsx("span",{children:be.find(t=>t.value===l.paymentMethod)?.label})]}),e.jsxs("div",{className:"mt-2 flex items-center justify-between gap-3 text-sm",children:[e.jsx("span",{className:"text-muted-foreground",children:"Discount"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(A,{type:"number",min:"0",step:"0.01",value:l.discountAmount,onChange:t=>S(s=>({...s,discountAmount:Number(t.target.value)||0})),className:"h-8 w-28 text-right",placeholder:"0.00"}),e.jsx("span",{className:"min-w-20 text-right",children:K>0?`-${j(K)}`:"No"})]})]}),e.jsxs("div",{className:"mt-2 flex items-center justify-between gap-3 text-sm",children:[e.jsx("span",{className:"text-muted-foreground",children:"Other charges"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(A,{type:"number",min:"0",step:"0.01",value:l.otherCharges,onChange:t=>S(s=>({...s,otherCharges:Number(t.target.value)||0})),className:"h-8 w-28 text-right",placeholder:"0.00"}),e.jsx("span",{className:"min-w-20 text-right",children:X>0?`+${j(X)}`:"No"})]})]}),e.jsxs("div",{className:"mt-3 rounded-lg border bg-background p-3",children:[e.jsxs("div",{className:"flex items-center justify-between gap-3 text-sm",children:[e.jsxs(y,{htmlFor:"pos-vat",className:"flex cursor-pointer items-center gap-2 font-normal",children:[e.jsx(Ue,{id:"pos-vat",checked:!!l.vatEnabled,onCheckedChange:t=>S(s=>({...s,vatEnabled:!!t,vatRate:s.vatRate||16}))}),"Add VAT"]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(A,{type:"number",min:"0",max:"100",step:"0.01",value:l.vatRate,onChange:t=>S(s=>({...s,vatRate:Number(t.target.value)||0})),disabled:!l.vatEnabled,className:"h-8 w-20 text-right"}),e.jsx("span",{className:"text-xs text-muted-foreground",children:"%"})]})]}),e.jsxs("div",{className:"mt-2 flex items-center justify-between text-sm",children:[e.jsx("span",{className:"text-muted-foreground",children:"VAT amount"}),e.jsx("span",{children:J>0?j(J):"No"})]})]}),e.jsxs("div",{className:"mt-4 flex items-center justify-between text-lg font-display font-bold",children:[e.jsx("span",{children:"Total"}),e.jsx("span",{className:"text-primary",children:j(Ne)})]})]}),e.jsx(q,{variant:"highlight",className:"w-full",onClick:Me,disabled:!f.length||r,children:r?"Recording sale...":"Record sale and update inventory"}),e.jsx("div",{className:"text-xs text-muted-foreground",children:"Recording a POS sale deducts inventory immediately. If you later cancel the order from Orders, stock can be restored there."})]})]}),v?e.jsxs(F,{children:[e.jsx(ee,{children:e.jsx(te,{className:"text-lg",children:"Last Sale"})}),e.jsxs(se,{className:"space-y-2 text-sm",children:[e.jsxs("p",{children:[e.jsx("span",{className:"font-medium",children:"Order:"})," #",String(v.id).slice(0,8).toUpperCase()]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-medium",children:"Status:"})," ",v.status]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-medium",children:"Payment:"})," ",String(v.paymentMethod||"").replace(/_/g," ")," (",v.paymentStatus,")"]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-medium",children:"Discount:"})," ",Number(v.discountAmount||0)>0?`-${j(Number(v.discountAmount||0))}`:"No"]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-medium",children:"Other charges:"})," ",Number(v.otherCharges||0)>0?`+${j(Number(v.otherCharges||0))}`:"No"]}),v.transactionReference?e.jsxs("p",{children:[e.jsx("span",{className:"font-medium",children:"Reference:"})," ",v.transactionReference]}):null,e.jsxs("p",{children:[e.jsx("span",{className:"font-medium",children:"Total:"})," ",j(Number(v.totalAmount||0))]}),e.jsx(q,{asChild:!0,variant:"outline",size:"sm",children:e.jsx(De,{to:`/admin/orders/${v.id}`,children:"Open order"})})]})]}):null]})]}),e.jsx(Ze,{open:V,onOpenChange:a,onCreated:Se}),B&&n&&e.jsx(Ye,{items:n.items,orderSummary:n.orderSummary,saleForm:n.saleForm,totalAmount:n.totalAmount,onClose:()=>{Q(!1),k(null),L()}})]})};export{wt as default};
