<template>
    <div v-if="alert.length" class="multisig_ban_container">
        <Alert type="error">
            {{ $t(alert) }}
        </Alert>
        <div class="is_multisig un_click radius" />
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { MosaicId, MultisigAccountInfo } from 'symbol-sdk';
import { NotificationType } from '@/core/utils/NotificationType';
import { AccountModel } from '@/core/database/entities/AccountModel';

@Component({
    computed: {
        ...mapGetters({
            networkMosaic: 'mosaic/networkMosaic',
            currentAccount: 'account/currentAccount',
            currentAccountMultisigInfo: 'account/currentAccountMultisigInfo',
        }),
    },
})
export default class DisabledFormOverlay extends Vue {
    /**
     * Overrides checks
     * @type{boolean}
     */
    @Prop({ default: false }) whitelisted: boolean;

    /**
     * Networks currency mosaic
     * @var {MosaicId}
     */
    public networkMosaic: MosaicId;

    /**
     * Current Account
     * @var {AccountModel}
     */
    public currentAccount: AccountModel;
    /**
     * Current account multisig info
     * @type {MultisigAccountInfo}
     */
    public currentAccountMultisigInfo: MultisigAccountInfo;

    /// region computed properties getter/setter
    /**
     * Whether a form should be disabled to a multisig account
     * @returns {boolean}
     */
    get disableToMultisig(): boolean {
        // Don't disable form when the form is multisig-friendly
        const multisigFriendlyRouteNames = ['dashboard.invoice'];

        if (multisigFriendlyRouteNames.some((a) => this.$route.matched.map(({ name }) => name).some((b) => b === a))) {
            return false;
        }
        // Disable the forms to accounts with cosignatories
        return (
            (this.currentAccountMultisigInfo && this.currentAccountMultisigInfo.cosignatoryAddresses.length > 0) ||
            this.currentAccount.isMultisig
        );
    }

    /**
     * Alert to be displayed
     * Id Alert is an empty string, this overlay won't render
     * @returns {string}
     */
    get alert(): string {
        if (this.whitelisted) {
            return '';
        }
        if (!this.networkMosaic) {
            return NotificationType.NO_NETWORK_CURRENCY;
        }
        if (this.disableToMultisig) {
            this.$emit('disableForm');
            return NotificationType.MULTISIG_ACCOUNTS_NO_TX;
        }
        return '';
    }
    /// end-region computed properties getter/setter
}
</script>

<style lang="less" scoped>
@import './DisabledFormOverlay.less';
</style>
