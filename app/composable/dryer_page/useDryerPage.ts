import Bins from "~/components/dryer_page/Bins.vue"
import Channel from "~/components/dryer_page/Channel.vue"
import Users from "~/components/dryer_page/Users.vue"
import ChannelHeader from "~/components/dryer_page/header/ChannelHeader.vue"
import BinHeader from "~/components/dryer_page/header/BinHeader.vue"
import AccessHeader from "~/components/dryer_page/header/AccessHeader.vue"

export const useDryerPage = () => {
    const page = ref<number>(0);

    const set_page = (newPage: number) => { 
        page.value = newPage;
    }

    const current_page = () => {
        switch (page.value) {
            case 0:
                return Channel;
            case 1:
                return Bins;
            case 2:
                return Users;
            default:
                return Channel;
        }
    }

    const current_header = () => {
        switch (page.value) {
            case 0:
                return ChannelHeader;
            case 1:
                return BinHeader;
            case 2:
                return AccessHeader;
            default:
                return ChannelHeader;
        }
    }

    return {
        page,
        set_page,
        current_page,
        current_header
    }
};