import jsPDF from "jspdf";

interface Employee {
  full_name: string;
  start_date: string;
  role: string;
}

interface Contract {
  weekly_hours: number;
  pay_rate: number;
}

export async function generateContractPDF(
  employee: Employee,
  contract: Contract
): Promise<jsPDF> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let y = 20;

  // Helper function to add text with word wrap
  const addText = (text: string, fontSize: number = 11, isBold: boolean = false) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    const lines = doc.splitTextToSize(text, maxWidth);
    
    lines.forEach((line: string) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, margin, y);
      y += fontSize * 0.5;
    });
    y += 2;
  };

  const addSection = (title: string, content: string) => {
    addText(title, 12, true);
    addText(content);
    y += 3;
  };

  // Calculate annual holiday entitlement
  const annualHours = (contract.weekly_hours * 52 * 0.128).toFixed(0);

  // Title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("NORTON SPORTS & LEISURE PROMOTIONS CIC", pageWidth / 2, y, { align: "center" });
  y += 8;
  doc.text("Contract of Employment", pageWidth / 2, y, { align: "center" });
  y += 10;

  // Employee name
  addText(`${employee.full_name} (The Employee)`, 12, true);
  y += 3;
  addText("Norton Sports & Leisure Promotions CIC [Company Number 08819758] (The Company)", 11, true);
  y += 5;

  // Key details
  addText(`Date of Commencement: ${new Date(employee.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`);
  addText(`Job title: ${employee.role}`);
  addText(`Rate of Pay: £${contract.pay_rate.toFixed(2)}`);
  y += 5;

  // Sections
  addSection(
    "PLACE OF WORK",
    "Your usual place of work is 74 Station Road, Norton, Stockton-on-Tees TS20 1PE but you may be required to work at such other places as may be necessary to enable you to properly carry out your duties."
  );

  addSection(
    "DATE OF COMMENCEMENT",
    "Your employment commenced on the date stated above. No employment with a previous employer counts as part of a period of continuous employment."
  );

  addSection(
    "PROBATIONARY PERIOD",
    "If you are a new employee, from the start date of your appointment with The Company your employment will be subject to a probationary period of six months, during which time you will be required to demonstrate to the satisfaction of The Company your suitability for the position in which you are employed. This period may be extended at the discretion of The Company and is without prejudice to the right of The Company to terminate your employment before the expiry of the probationary period. During your probationary period, the disciplinary procedure of The Company will not apply to you."
  );

  addSection(
    "HOURS OF WORK",
    `You will be required to work a minimum of ${contract.weekly_hours} hours per week. Details of hours to be worked will be arranged by the Manager. You may be required to work more than your minimum hours for which pay will be at your normal rate.`
  );

  addSection(
    "ABSENCE AND TIMEKEEPING",
    "The Company operates the statutory sick pay scheme and the Employee is required to cooperate with its administration. There is no sick pay provision beyond the statutory requirement. Should you be unable to attend work because of sickness or injury on any day which you are due to work, you must notify the Manager at least 8 hours prior to your start time to enable cover to be arranged. You should also give details of the nature of your illness and the day on which you expect to return to work. You must inform the Operations Manager if this date is to change for any reason.\n\nSickness absence up to and including seven consecutive days must be fully supported by a self certificate and thereafter by one or more doctor's certificates at intervals of not more than seven days during the period of sickness absence.\n\nYou must inform the Manager on the first day of your return to work after a period of sickness absence and complete a self certificate form if applicable. These forms can be obtained from the Manager or from the Norton Sports Charity Office."
  );

  addSection(
    "REMUNERATION AND BENEFITS",
    `Your rate of pay will be £${contract.pay_rate.toFixed(2)} per hour which will be reviewed on an annual basis with any changes to take effect from 1st April of any given year. The working week ends each Sunday and you will be paid on the following Thursday.`
  );

  addSection(
    "SALARY ERRORS",
    "Although rare, mistakes do sometimes occur in the calculation and payment of salaries. You should always check your payslip, and in the event of any discrepancy, raise the matter with the Manager in the first instance.\n\nIf there is any underpayment we will pay any shortfall as soon as practicable. In the event of any overpayment, The Company reserves the right to deduct this amount from future payments to you."
  );

  addSection(
    "HOLIDAY ENTITLEMENT",
    `Leave dates will be by mutual agreement with the Manager. The holiday year runs from 1 April to 31 March. Your annual leave entitlement is calculated based on your contracted hours. Your annual entitlement is ${annualHours} hours.\n\nLeave can be taken either hourly or in weeks. If leave is taken on an hourly basis, this will allow you to select specific days where appropriate, with these hours being deducted from your annual entitlement, where leave is taken based on full weeks, your full weeks contracted hours will be deducted from your hourly annual entitlement.\n\nFor holidays taken on an hourly basis you will be paid at your normal hourly rate. For holidays taken on a weekly basis, your pay will be based on an average working week over the previous 52 weeks.`
  );

  addSection(
    "PUBLIC/BANK HOLIDAYS",
    "If you do not work a bank holiday you DO NOT need to use a holiday for this day. If you usually work a Monday or choose to work a Bank Holiday then the usual hourly rate will apply."
  );

  addSection(
    "OTHER PAID LEAVE",
    "Any maternity, paternity, adoption, shared parental leave for which you are eligible will be paid at the statutory rate. You will be paid at your normal rate of pay for any parental bereavement leave or compassionate leave for which you are eligible. If you are required to complete Jury Service, you will continue to be paid at your normal rate of pay subject to the deduction of any monies received from the court in respect of loss of earnings."
  );

  addSection(
    "CONFIDENTIALITY",
    "The contract of employment between the Company and an employee is subject to the employee undertaking to keep the confidentiality of the Company. This undertaking commits the employee both during the period of employment and after termination of employment with the Company to protect the security of the Company information.\n\nTo protect our business we expressly forbid disclosure of details of any secret or confidential knowledge acquired in consequence of employment with the Company, for example, customers, suppliers, plans, etc.\n\nIf you have any concerns regarding potential breaches in confidentiality you should raise them without delay with the Manager."
  );

  addSection(
    "NOTICE OF TERMINATION TO BE GIVEN BY EMPLOYER",
    "Under 1 month's service – Nil;\n\nIf the employee has been employed by the employer for between one month and two years – one weeks' notice;\n\nIf the employee has been working for the employer continuously for two years or more - two weeks' notice plus one additional weeks' notice for each further complete year of continuous employment up to a maximum of 12 weeks."
  );

  addSection(
    "NOTICE OF TERMINATION TO BE GIVEN BY EMPLOYEE",
    "Under 1 month's service - Nil\n\n1 month's service or more - 2 weeks"
  );

  addSection(
    "AUTO ENROLMENT PENSION",
    "Auto enrolment pension details are available from the Manager and will be issued to you separately, if applicable. Employees who are eligible to join, and who are not already in a qualifying company pension scheme, will be automatically enrolled into this pension scheme."
  );

  addSection(
    "EXPENSES",
    "Prior approval must be given in respect of any expenses claims. If approved, The Company will reimburse you for costs wholly, exclusively and necessarily incurred on behalf of the Company in performing your duties on production of receipts."
  );

  addSection(
    "DISCIPLINARY PROCEDURE",
    "Disciplinary rules form part of your contract of employment and are in accordance with Acas Code of Practice on disciplinary and grievance procedures. Misconduct includes but is not limited to; bullying, harassment, insubordination and being absent without permission."
  );

  addSection(
    "GRIEVANCE PROCEDURE",
    "Should you feel aggrieved at any matter relating to your employment, you should raise the grievance with the Manager, either verbally or in writing. However, you should be aware that in order to avail yourself of certain statutory rights, you must set out your grievance and the basis for it in writing."
  );

  addSection(
    "UNACCEPTABLE BEHAVIOUR",
    "You should be aware that The Company expects high standards within the business and the following have been agreed as constituting gross misconduct i.e. conduct of such a nature that you can no longer be employed.\n• Theft or fraud.\n• Unauthorised possession of company property.\n• Wilful and malicious damage to: ~ Company property. ~ Property belonging to customers or fellow employees.\n• Gross insubordination.\n• Deliberate, calculated and unjustified rudeness to staff or customers.\n• Fighting or physical abuse.\n• Intentional disregard for safety or security rules, safe working methods etc.\n• Being under the influence of drink or drugs during working hours.\n\nThis list is neither exclusive nor exhaustive and in addition there may be other offences of a similar gravity that would also constitute gross misconduct."
  );

  addSection(
    "DATA PROTECTION",
    "The Company will collect and process information relating to you in accordance with current guidelines and GDPR rules."
  );

  addSection(
    "HEALTH AND SAFETY AT WORK",
    "Health and Safety is the top priority of The Company and employees are reminded that they have a statutory duty to observe all health and safety rules and take all reasonable care to promote the health and safety at work of themselves and their fellow employees. Wilful breaches of the Health and Safety Policy or neglect will be dealt with through the disciplinary procedure. Employees will be expected to attend any training given by the employer at any time"
  );

  addSection(
    "GOVERNING LAW AND JURISDICTION",
    "This agreement is governed by the law of England and Wales and the parties hereby submit to the exclusive jurisdiction of the courts of England and Wales in relation to it."
  );

  addSection(
    "CHANGES TO PERSONAL CIRCUMSTANCES",
    "It is important that you inform the Company through the Operations Manager of any changes to your personal circumstances such as change of address or telephone number, next of kin, bank or building society details, dependents, marriage or civil partnership, gain or loss of qualifications or loss of immigration permission.\n\nWe expect that you have given all the correct details concerning the above and we reserve the right to terminate your contract with or without notice or payment in lieu of notice if we discover that you have provided any false information in this or any other material respect."
  );

  addSection(
    "FLEXIBILITY CLAUSE",
    "Any variations to this contract will be notified to you and confirmed in writing within one month. The Company will enter into a dialogue with you regarding any changes in hours to be worked or rates of pay."
  );

  return doc;
}
