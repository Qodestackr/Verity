
import { getUsersForApproval } from "@/actions/user";
import UserApprovalList from "@/components/admin/user-approval-list"

export default async function UserApprovalPage({
    searchParams,
}: {
    searchParams: { page?: string; limit?: string }
}) {
    const page = searchParams.page ? parseInt(searchParams.page) : 1
    const limit = searchParams.limit ? parseInt(searchParams.limit) : 20

    const { users, pagination } = await getUsersForApproval(page, limit)

    return (
        <div className="max-w-5xl mx-auto py-10">
            <h1 className="text-2xl font-light mb-2">User Approval Management</h1>
            <UserApprovalList users={users} pagination={pagination} />
        </div>
    )
}
