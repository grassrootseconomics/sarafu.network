import type { NextPage } from "next";
import Link from "next/link";
import { buttonVariants } from "~/components/ui/button";

const Home: NextPage = () => {
  return (
    <div className="my-4 p-8 max-w-4xl mx-auto">
      <div>
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold">Terms and Conditions</h1>
        </div>
        <div className="pb-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-500 text-center">
            SARAFU-CREDIT & SARAFU.NETWORK TRADE EXCHANGE POLICY, RULES, &
            REGULATIONS, TERMS of SERVICE
          </h3>
        </div>
        <ul className="list-disc space-y-4 my-6">
          <li>
            <strong className="font-bold">No cash-outs:</strong> There is no
            guaranteed exchange between Kenyan Shillings and Sarafu or any other
            token on the Sarafu Network.
            <div className="pt-2">
              <strong className="font-bold">
                Hakuna kubadilisha Sarafu iwe ksh:
              </strong>
              Hakuna hakikisho ya ubadilishaji Kati ya pesa ya kenya na Sarafu
              au token yoyote kwa Sarafu Network.
            </div>
          </li>

          <li>
            <strong className="font-bold">Gifts only:</strong> Accepting Sarafu
            or any other token on the Sarafu Network is voluntary and considered
            a gift.
            <div className="pt-2">
              <strong className="font-bold">Zawadi pekee:</strong> Kukubali
              Sarafu au token yoyote kwa Sarafu Network ni hiari yako na
              huzingatiwa kama Zawadi.
            </div>
          </li>

          <li>
            <strong className="font-bold">No redemption:</strong> There is no
            guarantee of redemption for Sarafu or any other token on the Sarafu
            Network in any form, goods, services or Kenyan Shillings.
            <div className="pt-2">
              <strong className="font-bold">
                Hakuna hakikisho yoyote ya kutumia Sarafu au token yoyote ile
                kwa mtandao wa sarafu kwa namna yoyote ile, bidhaa, huduma au
                pesa ya kenya.
              </strong>
            </div>
          </li>

          <li>
            <strong className="font-bold">
              Loss of account or tokens at any time:
            </strong>
            Any account or token holding on Sarafu Network is subject to holding
            fees to help community members and can be closed at any time.
            <div className="pt-2">
              <strong className="font-bold">
                Kupoteza akaunti au tokens wakati wowote:
              </strong>
              Akaunti yoyote au kumiliki token kwa mtandao wa sarafu utatozwa
              ada na akaunti unaweza fungwa wakati wowote.
            </div>
          </li>
        </ul>
        <div className="font-light pt-5 flex flex-col gap-3">
          <p>
            The purpose of the following Trading Procedures, Policies, Rules and
            Regulations is to facilitate trading among members of Organizations
            by promoting a system of good business practice and understanding of
            the guidelines set forth by various trading networks and
            organizations that work together with Grassroots Economics
            Foundation (GEF) Sarafu-Credit (SC), an entity of GEF, hereinafter
            referred to as SC Trading Network or Sarafu Network. These Trading
            Procedures, Policies, Rules and Regulations also form part of and
            are included in any voucher or community currency verified,
            digitally created or printed and allocated by SC Trading Networks,
            including but not limited to: all Community Currency, Voucher or
            Token Programs, Sarafu, Bangla-Pesa, Gatina-Pesa, Ng'ombeni-Pesa,
            Lindi-Pesa and Kangemi-Pesa.
          </p>
          <div className="space-y-2">
            <strong>1. NATURE OF THE PARTIES</strong>
            <p>
              An organization or individual applies for an audit and
              verification with GEF. This applicant is hereinafter referred to
              as Client. By using Sarafu-Credit in paper form or digitally
              through sarafu.network the, Client agrees to abide by these
              Trading Procedures Policies Rules and Regulations contained
              herein. SC Trading Network acts as a facilitator for the
              development of a trading network and auditor of all vouchers
              issued to the client. Client is an individual or legal entity that
              willingly uses the SC Trading Network to trade its goods and or
              services among its members and wishes to be issued vouchers to
              facilitate barter trade exchange services.
            </p>
          </div>
          <div className="space-y-2">
            <strong>2. NATURE OF SC VOUCHERS and TOKENS</strong>
            <p>
              A 'trade' is a purchase or sale of goods and or services whereby
              payment is made via barter using SC Vouchers or Tokens pursuant to
              the terms contained in this Agreement. A SC Voucher or Token is an
              accounting unit used to record the value of a trade -SC as well as
              each Token has a viable exchange rate to Kenyan Shillings at the
              time of trade. Ownership of SC or Tokens on SC Network denotes the
              acceptance of a gift and no right to receive goods or services
              available within the SC Trading Network Marketplace. SC may be
              used only in the manner and for the purpose set forth in this
              Agreement; SC will not be considered legal tender, securities or
              commodities and may not be redeemed for Kenyan Shillings. SC
              Trading Network disclaims responsibility for the negotiability of
              SC or for the availability of goods and services from any source.
              SC physical printed vouchers are issued with an expiration date or
              maturity period called the term. At the end of the term SC has no
              redeemable value for barter exchanges. All SC in any Client
              account will be subject to an automatic holding tax on a weekly or
              monthly basis.
            </p>
          </div>
          <div className="space-y-2">
            <strong>3. STANDARDS AND TRANSPARENCY</strong>
            <p>
              As a responsible third party record keeper and auditor, SC Trading
              Network facilitates the development and operation of peer-to-peer
              Client's mutual-credit clearing systems. Each client is audited
              for the number of members that qualify for a SC Voucher allotment.
              This verification process involves a questionnaire and the
              establishment of local guarantors for the new Client member. The
              amount of SC Vouchers allocated to the Client depends on the size
              and types of members therin. The vouchers issued are to be used as
              the vouchers of each businesses among the client.
            </p>
          </div>
          <div className="space-y-2">
            <strong>4. TRADE COORDINATING FUNCTION</strong>
            <p>
              SC Trading Network serves in a trade coordinating capacity in
              organizing and facilitating trade among Clients and members of
              Clients. Responsibility for the conduct of a trade is exclusively
              that of the Clients and members of the Client participating in the
              trade. The duty to inspect goods for quality and quantity and
              fitness for purpose, to evaluate the quality of services, or to
              obtain or act upon any warranty rests upon the buyer Client. SC
              Trading Network will use its best efforts to broker the Client's
              SC into goods and services, to accurately record trades, and to
              administer Client agreements and trading rules in accordance with
              their terms. However, Client acknowledges that the sole principals
              in any trades are the buying and selling Clients involved, that
              the trades are entered into voluntarily and that SC Trading
              Network is not the guarantor of any product, service or token. SC
              Vouchers are ultimately and fully backed by the assets, goods and
              services of the Client.
            </p>
          </div>
          <div className="space-y-2">
            <strong>5. EXCHANGE PARTICIPATION</strong>
            <p>
              SC Trading Network or its owner entities may maintain an account
              in the system and transact business through the network and agree
              to abide by the same terms and conditions of all Clients. Any SC
              Vouchers or Tokens associated must be audited, allocated and
              maintained using the same criteria that are applied to all Client
              accounts. Such Clients shall have no privileged access to goods or
              services or special treatment.
            </p>
          </div>
          <div className="space-y-2">
            <strong>6. AVAILABILITY OF PRODUCTS OR SERVICES</strong>
            <p>
              SC Trading Network shall use its best efforts to solicit new
              businesses as Clients, having goods or services to satisfy the
              needs of all Clients. Because of high Client demand and short
              supply, certain items may be available on a limited basis only
              (i.e., appliances, TVs, furniture, airline tickets, tires,
              computers, cameras, lumber, etc.). SC Trading Network is committed
              to showing availability of those products or services actually
              available in the exchange system.
            </p>
          </div>
          <div className="space-y-2">
            <strong>7. DEFINITION OF CLIENT IN GOOD STANDING</strong>
            <p>
              A Client and all client members who conduct trades in accordance
              with this agreement, is current in any monies owing to SC Trading
              Network, and has a valid unexpired SC Vouchers, is considered, a
              'Client in good standing'. Only Clients in good standing are
              entitled to the services of SC Trading Network. However, the
              status of a Client in good standing shall not constitute any
              representation by SC Trading Network regarding the reputability of
              any buyer or seller in any trade transaction and SC Trading
              Network shall have no liability for the conduct of any Client or
              the quality of goods or services traded. Where a Client has by his
              or her conduct or misconduct displayed to SC Trading Network
              inability to meet the standards set in Client's own industry
              relative to the quality of goods or services, or has been charged
              with the commission of a crime involving fraud or moral turpitude,
              or otherwise exhibits to SC Trading Network that Client's
              reputation in the business community has been diminished, then for
              the protection of the remaining Clients, GEF reserves the right to
              terminate said Client's account or restrict the rights of said
              Client to sell or advertise Client's goods or services for sale
              until such time said Client can exhibit to SC Trading Network that
              the standard expected in Client's own industry can be met.
            </p>
          </div>
          <div className="space-y-2">
            <strong>8. DUTIES OF CLIENT</strong>
            <ul className="list-disc list-inside">
              Membership Changes
              <li>
                The Client must keep GEF informed as the registration of new
                members and removal of members. Each Voucher sent by the Client
                must be 100% backed by the goods and services of the Client and
                the clients members.
              </li>
              <li>
                A Client that issues or creates a Token on the SC Network must
                accept the token for goods and/or services.
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <strong>9. DELINQUENT ACCOUNTS</strong>
            <p>
              In the event the Client has not informed GEF of changes of
              membership beyond sixty (60) days, Client agrees to waive all
              rights to Client's usage of any CCs in amounts greater than their
              initial allotments. In default each member of the Client should
              return the amount of SC Vouchers initially allotted to them. At
              the discretion of SC Trading Network, an account closed for lack
              of transparency may be re-opened within one hundred and eighty
              (180) days and Client may reclaim the trade Vouchers. On a weekly
              basis 0.5% of a Client's Sarafu balance will be deducted and added
              to a reward pool distributed to active user.
            </p>
          </div>
          <div className="space-y-2">
            <strong>10. CHARITABLE DONATIONS</strong>
            <p>
              Client may elect to donate SC Vouchers or Tokens to a qualified
              charitable organization or individuals. A 'qualified charitable
              organization' is an organization with charitable status as granted
              by the Kenya Revenue Service and which is or has agreed to become
              a Client of the SC Trading Network. SC Trading Network agrees to
              facilitate the donation by allocating Clients' Vouchers, but the
              donation will be deemed to be from Client to the charity and
              Client shall have sole responsibility for ensuring any tax
              deductibility of the donation and the charitable status of the
              organization. SC Trading Network or the Client shall make the
              transfer of donated trade Vouchers upon written notification by
              Client stating the amount of the trade credits to be donated and
              the name of the qualified charitable organization designated to
              receive the donation. Any required receipts for the donation shall
              be issued directly by the charity to Client.
            </p>
          </div>
          <div className="space-y-2">
            <strong>11. LAWS AND REGULATIONS</strong>
            <p>
              Client shall abide by all applicable laws or regulations
              appropriate to the conduct of its business and any trading
              transaction and SC Trading Network shall not be responsible on the
              part of Client to comply. Client shall hold SC Trading Network
              harmless for any action SC Trading Network takes to comply with
              the applicable laws or regulations.
            </p>
          </div>
          <div className="space-y-2">
            <strong> 12. TIPS AND GRATUITIES</strong>
            <p>
              The buying Client shall pay all tips and gratuities in cash at
              point of purchase. SC Trading Network will not keep any record for
              tips and gratuities payments.
            </p>
          </div>
          <div className="space-y-2">
            <strong> 13. TAXES</strong>
            <p>
              Seller shall charge the appropriate sales taxes or VAT in cash,
              and collect and record these on the invoice at the time of sale.
              SC does not collect sales taxes on members' behalf. Clients are
              advised that transactions involving SC Voucher are generally
              treated as taxable events for Kenya Revenue Authority and Local
              tax purposes. The declaration and reporting of all applicable
              Local, County and National taxes resulting from trade transaction
              rests solely with the Client. Client agrees to not hold SC Trading
              Network liable for any actions SC Trading Network takes to comply
              with Kenyan tax law.
            </p>
          </div>
          <div className="space-y-2">
            <strong> 14. ASSIGNMENT OF ACCOUNT</strong>
            <p>
              A Client's account is not assignable or transferable to any
              person, third party or businesses without SC Trading Network
              express prior written consent. If clients/company assets/goods or
              services being used as security against any SC loaned are no
              longer available, sold, or the company itself is sold or merged
              with another company, SC Trading Network will withdraw the
              allocated SC Vouchers or call for repayment on demand (see clause
              26 Termination). If a Client ceases trading for any reason, any
              goods or services that have been purchased which results in a
              Client having a balance in Vouchers less than their initial
              allotment (negative balance) remain secured to SC Trading Network
              until the negative balance has been reduced to zero. The SC
              Vouchers may not be advertised for sale without SC Trading Network
              express prior written consent.
            </p>
          </div>
          <div className="space-y-2">
            <strong> 15. FAIR PRICING</strong>
            <p>
              Client agrees to furnish all goods and services at Client's normal
              prevailing prices. SC Trading Network reserves the right to
              investigate complaints of overpricing, i.e. where seller is
              charging a higher price for goods or services sold on SC Vouchers
              than normal terms. Violations may result in termination of
              Client's account.
            </p>
          </div>
          <div className="space-y-2">
            <strong>16. STANDBY</strong>
            <p>
              A Client can request in writing to SC Trading Network that their
              account be placed on 'standby' in the event that they wish to
              temporarily suspend trading within the network but not terminate
              their account. An account may be placed on standby under the
              following conditions: 1) Client account must have a positive trade
              credit balance (equal to or higher than their starting balance in
              SC Vouchers).
            </p>
          </div>
          <div className="space-y-2">
            <strong>17. SUSPENSION OF TRADING PRIVILEGES</strong>
            <p>
              SC Trading Network reserves the right, at its sole discretion, to
              suspend the trading privileges of any Client who:
            </p>
            <ol className="list-decimal ml-8">
              <li>
                Commits fraud against SC Trading Network or any other Client.
                Fraud shall include furnishing false information to SC Trading
                Network in this agreement or SC Trading Network vouchers
                application, which Client warrants is accurate to the best of
                its knowledge.
              </li>
              <li>
                Violates the terms of this Agreement or any other agreement with
                SC Trading Network.
              </li>
              <li>
                Has outstanding cash fees due to SC Trading Network which are
                more than sixty (60) days past due.
              </li>
              <li>
                Client who has a negative trade balance (purchases exceed
                sales), who does not promptly respond to requests from other
                clients purchase inquiries will be interpreted as a refusal to
                repay the trade credit loan.
              </li>
              <li>
                Behaves in a manner that is detrimental to the SC Trading
                Network and/or fellow Clients. Such detrimental behaviour shall
                include abuses of the Client list, including spamming or the
                unauthorized release of Clients information to third parties.
              </li>
              <li>
                Conducts trades of illegal or prohibited items. Prohibited items
                shall include firearms or other weapons, illegal drugs, drug
                paraphernalia, prostitution, and pornography. SC Trading Network
                reserves the right to amend the list of prohibited items at its
                discretion.
              </li>
              <li>
                Violates the terms of confidentiality contained in this
                Agreement by disclosing online trading system information or by
                failing to take reasonable measures to protect such confidential
                information.
              </li>
              <li>
                Ceases to be a Client in good standing in SC Trading Network.
              </li>
              <li>
                Clients reputation rating as a buyer or seller does not meet
                minimum standard as set by SC Trading Network.
              </li>
            </ol>
            <p>
              In the event of such suspension, SC Trading Network shall give
              written notice to Client and Client shall immediately cease the
              use of the trading system.
            </p>
          </div>
          <div className="space-y-2">
            <strong>18. TERMINATION</strong>
            <p>
              Either party may terminate this agreement, with or without cause,
              upon ten (10) days written notice to the other party. Upon
              termination, all cash and trade credit service fees outstanding
              become due and payable; transaction fees are non-refundable. If
              Client has a negative SC balance (purchases exceed sales) at the
              time of termination, Client must balance the account with trade
              credit within thirty (30) days of the termination date. If any
              negative trade balance remains after the thirty (30) day period,
              Client shall immediately pay SC Trading Network any remaining
              balance in cash. Failure to repay within the required time-scale
              will result in immediate legal proceedings being instigated to
              recover the debt in cash Kenyan Schillings (KSH) and any legal
              costs incurred. SC Trading Network reserves the right to transfer
              the debt to a Debt Collection Agency. If Client has a positive SC
              balance (sales exceed purchases) at the time of termination,
              Client may stay active for a period of thirty (30) days for the
              purpose of making purchase trades only until purchases equal sales
              by paying SC Trading Network in advance the cash service fees on
              the positive SC balance, until SC Vouchers are spent. Any positive
              SC Voucher balance not spent within thirty (30) days of
              termination shall be forfeited by Client and will be considered
              forfeited.
            </p>
          </div>
          <div className="space-y-2">
            <strong>
              19. AMENDMENT OF TRADING PROCEDURES, POLICIES, RULES AND
              REGULATIONS
            </strong>
            <p>
              SC Trading Network may, in its sole discretion, change the Trading
              Procedures, Policies, Rules and Regulations and reserves the right
              to change the annual retainer fees and transaction fees from time
              to time by giving Client thirty (30) days prior written notice.
              Failure to give SC Trading Network written notice of rejection of
              such changes within such thirty (30) day period and engaging in
              purchase or sales transactions after such after thirty (30) day
              notice period shall be deemed as acceptance by Client of the new
              terms. All changes to this agreement must be in writing and must
              be signed by an authorized representative of SC Trading Network.
            </p>
          </div>
          <div className="space-y-2">
            <strong> 20. DISCLAIMER OF LIABILITY</strong>
            <p>
              SC Trading Network makes no representation or warranty either
              expressed or implied and disclaims all liability as to the
              fitness, quality, delivery date, merchantability, prices or any
              item of the trade transaction. Client does hereby indemnify and
              hold SC Trading Network harmless with respect to any claim, debt,
              or liability whatsoever, arising out of any transaction wherein
              Client is buyer or seller. Client acknowledges that any trade
              transaction in which it participates is strictly voluntary. Client
              further agrees to hold SC Trading Network harmless for any
              liability whatsoever arising out of the use, administration or
              operation of the trading network.
            </p>
          </div>
          <div className="space-y-2">
            <strong>21. DISPUTES AND ARBITRATION</strong>
            <p>
              SC Trading Network is functioning in a trade coordinating
              capacity, and as a third party record keeper, is to be held
              harmless from any liability arising out of transactions between
              Clients. In the event of any dispute arising out of a transaction
              between Clients, the parties seeking resolution shall refer the
              dispute to binding arbitration under the rules of the Kenyan
              Arbitration Association within twenty-one (21) days of the receipt
              of the goods or services or the commencement of the dispute. The
              decision of the arbitrator(s) in such dispute shall, unless waived
              by both parties, be referred to a court or whoever has
              jurisdiction in the matter and entered into judgment.
            </p>
          </div>
          <div className="space-y-2">
            <strong>22. ENFORCEMENT</strong>
            <p>
              Each and every term and provision and every last term and
              provision contained in these Trading Procedures, Policies, Rules
              and Regulations is severable from every other term and provision
              therein. If any such term or provision shall be judged invalid,
              illegal or unenforceable, it shall not affect the validity,
              legality or enforceability of the remainder of any other term or
              provision of these Trading Rules and Regulations. The remainder
              shall remain valid, legal and enforceable and in full force and
              effect. In the event that legal action must be taken by SC Trading
              Network against a Client to enforce any provision of these Trading
              Procedures, Policies, Rules and Regulations, SC Trading Network
              shall be entitled to recover solicitor's fees, costs and late fees
              of $20 per month from the date of default until payment.
            </p>
          </div>
          <div className="space-y-2">
            <strong>23. ADVERTISING</strong>
            <p>
              Unless otherwise stipulated between the parties to this agreement,
              Client authorizes SC Trading Network to notify and advertise to
              other Clients the availability of Client's products or services.
            </p>
          </div>
          <div className="space-y-2">
            <strong>24. SPECIAL TRADE PROCEDURES</strong>
            <p>
              The following procedures apply to transactions involving special
              orders, construction jobs, service work, long term leases and
              other work-in-progress transactions: 1) Client should obtain a
              written estimate before authorizing work to begin. 2) Before
              starting, Client should obtain a deposit or down payment in
              Sarafu-Credit, with an online or SMS confirmation and
              authorization number, or with a physical trade voucher (if one is
              used) in the same manner as a cash transaction.
            </p>
          </div>
          <div className="space-y-2">
            <strong>25. CONFIDENTIALITY AND NON-DISCLOSURE</strong>
            <p>
              Client acknowledges that, as a Client of the SC Trading Network,
              it will have access to information and materials that are
              confidential and proprietary to SC Trading Network or other
              Clients of the network. Client agrees not to disclose information
              about the credit-clearing software, Client account data, Client
              contact data, Clients list or Clients' email addresses to any
              person or entity except to other Clients or those specifically
              authorized by SC Trading Network to have access to this
              information. Client also agrees to take reasonable precautions to
              safeguard the confidentiality and security of such information.
            </p>
          </div>
          <div className="space-y-2">
            <strong>26. JOINT AND SEPARATE LIABILITY</strong>
            <p>
              If this application is accepted and an account is opened for the
              Client in SC Trading Network, the Client and the individual
              signing for the Client hereby assume joint and separate
              responsibility for all purchases and fees as outlined in this
              agreement.
            </p>
          </div>
          <div className="space-y-2">
            <strong>27. DISSOLUTION</strong>
            <p>
              In the event that SC Trading Network terminates or otherwise
              ceases to do business, all Clients in a negative trade position
              will pay amounts they owe in cash (one trade Voucher being equal
              to one Kenyan Shillings) into a fund. The fund, less expenses,
              plus any SC Trading Network inventory will be distributed pro rata
              to all Clients who are in a positive trade position. Thus, all
              Clients in a positive position will receive cash and/or goods for
              their trade dollars to the extent that the funds permit. SC
              Trading Network shall not be liable to any Client's cash or trade
              Vouchers beyond the distribution of such funds as aforesaid.
              Cessation of the SC Trading Network's operations does not release
              any Client from liability to make any payment due to SC Trading
              Network at the time the SC Trading Network's operations cease.
            </p>
          </div>
          <div className="space-y-2">
            <strong> 28. LAW</strong>
            <p>
              In the event of any legal disputes arising from these Trading
              Procedures, Policies, Rules and Regulations the Laws of Kenya
              shall apply. All transactions using SC Vouchers should be
              considered as barter trade.
            </p>
            <ol className="ml-4 list-decimal list-inside">
              <li>
                Central Bank of Kenya Act Cap 491 - S.21 states that : "All
                monetary obligations or transactions entered into or made in
                Kenya shall be deemed to be expressed and recorded, and shall be
                settled, in Kenya currency unless otherwise provided for by law
                or agreed upon between the parties" The highlighted part in
                section 21 above gives parties in a transaction the leeway to
                decide what "currency" to use when transacting Consequently , it
                is my belief that one can chose to use Kenyan currency , Foreign
                currency or barter for goods /services so long as the parties
                are in agreement
              </li>
              <li>
                Interpretation and General Provisions Act Cap 2 - S.3: This Act
                defines the word sell as follows : “sell” includes barter,
                exchange and offer to sell or expose for sale.."
              </li>
            </ol>

            <p>
              From this and other statutes examined , barter trade is envisaged
              as part of normal trading .i.e. a normal buying and selling
              transaction in the Kenyan market.
            </p>
            <strong>
              None of the Statutes reviewed expressly prohibits or deems barter
              trade as an illegal activity
            </strong>
            <p>
              Conclusion: Barter Trade is a legal method of transacting between
              parties . In my view therefore, an illegality will only arise
              where the Foundation attempts to counterfeit currency - which is
              an offense with very steep penalties under Kenyan law ( See Penal
              Code - Cap 63). Also note that usage of Bangla-Pesa an example SC
              Voucher was deemed legal haven't not violated any laws under the
              CBK or KRA act by the office of the D.P.P.
              <Link
                className={buttonVariants({ variant: "link", size: "xs" })}
                href="https://grassecon.org/theme/pdfs/office-of-director.pdf"
              >
                See his comments
              </Link>
            </p>
          </div>
          <div className="space-y-2">
            <strong>29. CLIENT ACKNOWLEDGMENTS AND WARRANTY</strong>
            <p>
              Client acknowledges that they have read the currently effective
              Trading Procedures, Policies, Rules and Regulations, and that such
              Rules and Regulations may be changed by SC Trading Network from
              time to time in accordance with these Trading Procedures,
              Policies, Rules and Regulations. Client warrants that it provided
              all information to SC Trading Network in good faith and that such
              information is accurate to the best of its knowledge.
            </p>
          </div>
          <div className="space-y-2">
            <strong> 30. COMMITMENTS AND REPRESENTATIONS</strong>
            <p>
              SC Trading Network is only responsible for any commitments and
              representations made in writing by a duly authorized officer.
              Brokers, agents, or employees of SC Trading Network have no right
              to bind SC Trading Network to any obligation or representation
              whatsoever without such written authorization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
